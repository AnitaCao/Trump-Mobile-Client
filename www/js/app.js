  angular.module('ionicApp', ['ionic'])

  .config(function($stateProvider, $urlRouterProvider) {

    
    $stateProvider
      .state('signin', {
        url: "/sign-in",
        templateUrl: "sign-in.html",
        controller: 'SignInCtrl'
      })
      .state('forgotpassword', {
        url: "/forgot-password",
        templateUrl: "forgot-password.html"
      })
      .state('tabs', {
        url: "/tab",
        abstract: true,
        templateUrl: "tabs.html"
      })
      .state('tabs.home', {
        url: "/home",
        views: {
          'home-tab': {
            templateUrl: "home.html",
            controller: 'HomeTabCtrl'
          }
        }
      })
      .state('tabs.request', {
        url: "/request",
        views: {
          'home-tab': {
            templateUrl: "request.html",
            controller: 'RequestCtrl'
          }
        }
      })
            .state('tabs.mydetail', {
        url: "/mydetail",
        views: {
          'home-tab': {
            templateUrl: "mydetail.html",
            controller: 'MyDetailCtrl'
          }
        }
      }) 
      .state('tabs.doctors', {
        url: "/doctors",
        views: {
          'home-tab': {
            templateUrl: "doctors.html",
            controller: 'DoctorsListCtrl'
          }
        }
      })

      .state('tabs.patients', {
        url: "/patients",
        views: {
          'home-tab': {
            templateUrl: "patients.html",
            controller: 'PatientListCtrl'
          }
        }
      })
      .state('tabs.patient-detail', {
        url: "/patient",
        views: {
          'home-tab': {
            templateUrl: "patient-detail.html",
            controller: 'PatientDetailCtrl'
          }
        }
      })  

 
      .state('tabs.about', {
        url: "/about",
        views: {
          'about-tab': {
            templateUrl: "about.html"
          }
        }
      })
      .state('tabs.navstack', {
        url: "/navstack",
        views: {
          'about-tab': {
            templateUrl: "nav-stack.html"
          }
        }
      })
      .state('tabs.contact', {
        url: "/contact",
        views: {
          'contact-tab': {
            templateUrl: "contact.html"
          }
        }
      });


     $urlRouterProvider.otherwise("/sign-in");

  })

  .factory('myFactory', function(){
    var patientsDetails = [];
    //var patientNames = [] ;
    var currentUser = [];
    
    return { 
      setPatientsDetails : function(patientsDetails){
        this.patientsDetails = patientsDetails;
      },
      getPatientsDetails : function(){
        return patientsDetails;
      },
      setCurrentUser : function(currentUser){

        this.currentUser = currentUser;
      },
      getCurrentUser : function(){
        return currentUser;
      },
      addPatientsDetails : function(patientDetail){
        patientsDetails.push(patientDetail); 
        return patientsDetails;  
      }
    }
  })

  .constant('OpenmrsTrumpUrl','http://localhost:8080/openmrs/ws/rest')

  .controller('SignInCtrl', function($scope, $state,$http,OpenmrsTrumpUrl, myFactory) {
    $scope.user = {};
    $scope.signIn = function() {
   
      console.log('Sign-In', $scope.user);

      if($scope.user.username != null && $scope.user.password != null){

        $http.defaults.headers.common.Authorization = 'Basic ' + btoa($scope.user.username + ':' +$scope.user.password);

        $http.defaults.useXDomain = true;

        //send a http requet to Openmrs to see if it is allowed or not. we chose concept because for now, the concept resource can be accessed by anyuser, 
        //we can change to other resource as well. We do not need to result of this request, we just need to know if it is success or not. If success, which
        //means user is a correct user in Openmrs. Then we can go to Home page. 
        $http.get(OpenmrsTrumpUrl + "/v1/concept/")

        .success(function(data){
          //clear currentUser before add a new one inside. Make sure only has one username in it. 
          myFactory.setCurrentUser(myFactory.getCurrentUser().pop());
          myFactory.getCurrentUser().push($scope.user.username);

          console.log("sing-in-currentuser: ", myFactory.getCurrentUser());

          // go to Home page.
          $state.go('tabs.home');
        }).
        error(function(data){
           alert('Incorrect Password or Username, Please Re-enter!');
        });

        //if username or user password is empty, alert : input username or password     
      }else {
        alert('Please input Username and/or Password!');
      };
    };
    
  })

  .controller('RequestCtrl', function($scope,$ionicModal,$http,OpenmrsTrumpUrl){
       
  // Load the modal from the given template URL
      $ionicModal.fromTemplateUrl('modal.html', function($ionicModal) {
          $scope.modal = $ionicModal;
      }, {
          // Use our scope for the scope of the modal to keep it simple
          
          // The animation we want to use for the modal entrance
          animation: 'slide-in-up'
      }); 
  })


  .controller('HomeTabCtrl', function($scope, myFactory) {
    //if current user is "testuser", who is a doctor, in the home page , we need to hide the myDoctor option and myDetail option. If current user is "john123",
    //who is a trump patient user, we need to hide myPatients option . Note : we are using these two username to decide what option to hide, which is 
    //not good. we need to change it to get the user role by the user's username, which will invole another http request to openmrs, firstly get the user detail by username,
    //then get the roles list in the result, then in the roles list, find out if the list contains "TrumpPatient" or "Doctor". If the list contains "TrumpPatient", 
    //hide the "myPatients" option, if the list contains "Doctor", hide the "myDoctor" and "myDetail" option. 
    
    if(myFactory.getCurrentUser()[0]=="john123"){
      $scope.myPatients = true;
    }else if(myFactory.getCurrentUser()[0] == "testuser"){
      $scope.myDoctor = true;
      $scope.myDetail = true;
    }

    console.log('HomeTabCtrl--CurrentUser is : ', myFactory.getCurrentUser()[0]);
    
  })


  .controller('PatientDetailCtrl', function($state, $scope,$http, OpenmrsTrumpUrl, myFactory, $location){
    $scope.patientDetail = [];

    $scope.showPatientDetail = myFactory;

    //in patients page, when we chose one patient to see his detail info, we pass parameter "v" to the next page ("patient-detail"), this parameter indicates the index of 
    //the patients in the patients list, so we know which patient we want to get from the global varable -- "patientsDetail" .
    $scope.currentPage = $location.search().v;

    $scope.patientDetail = ($scope.showPatientDetail.getPatientsDetails()[$scope.currentPage]);

    console.log("current page is : ", $scope.currentPage);

    console.log("PatientDetail in response page : " , $scope.showPatientDetail.getPatientsDetails()[$scope.currentPage]);

  })


  .controller('PatientListCtrl', function($state, $scope,$http, OpenmrsTrumpUrl, myFactory) {

    $scope.patientDetail = myFactory;
    $scope.patientDetail.setPatientsDetails([]);  

    $scope.patientNames = [];
    $scope.patient = {};
    $scope.patientuuids = [];

    $http.defaults.useXDomain = true;

    //here we set the url manually because we only use one usecase for the doctor whose uuid is 5f4d1d28-5986-4cb7-9edd-6145f544b5e3, if we need to do this in the normal way, we 
    //need to get the logined-in username, and send a http request to "../v1/user?q=[username]", and get the uuid of this user (this doctor). 
    //"include_invalidated=true" means we want to get all the patientassignments which related to this user, including invalidated assignments (deleted ones). 

    $http.get(OpenmrsTrumpUrl + "/v1/trumpmodule/patientassignment?assigned_user_id=5f4d1d28-5986-4cb7-9edd-6145f544b5e3&include_invalidated=true")
    .success(function(data){
      for(var i = 0; i < data.results.length; i++){
        // get the patient uuid from the results which are patientAssignments. The uuid of patient is inside the display value. 
        $scope.patient.uuid = data.results[i].display.substr(10,36);

        //put the patient's uuid to "patientuuids", duplicates are not allowed . 
        if($scope.patientuuids.indexOf($scope.patient.uuid) < 0){
            $scope.patientuuids.push($scope.patient.uuid);

            //send another request to get the patient which assigned to the doctor, according to the patient uuid
            $http.get(OpenmrsTrumpUrl + "/v1/patient/"+$scope.patient.uuid)
            .success(function(patientData){
                // the patient.name is actually not just the name, it also contain the openmrs kind of Id (such as "100-8")
                $scope.patient.name = patientData.display;

                //put the patientDetail to the global varable.  we need to share this information with the next page for showing the patient's detail, duplicates are not allowed .
                if($scope.patientDetail.getPatientsDetails().indexOf(patientData) < 0){
                  $scope.patientDetail.setPatientsDetails($scope.patientDetail.addPatientsDetails(patientData));
                }    

                console.log("patientsDetails : ", $scope.patientDetail.getPatientsDetails());

                // push the patient names to the patientNames list for showing them use ng-repeat in paitent.html page, duplicates are not allowed . 
                if($scope.patientNames.indexOf($scope.patient.name) < 0){
                  $scope.patientNames.push($scope.patient.name);
                }
          
                console.log('patientdata', patientData.display);   
            });
            console.log(i+":" , $scope.patient.uuid); 
        }

      }  
      
    });  
    console.log('PatientListCtrl');

  })


  .controller('DoctorsListCtrl', function($state, $scope,$http, OpenmrsTrumpUrl, myFactory) {

    $scope.doctor = myFactory;
    $scope.patient = [];
    $scope.doctors = [];

    $http.defaults.useXDomain = true;

    //here we set the url manually because we only use one usecase for the patient whose uuid is 73efdf58-7979-4da2-bc01-8ee613062b68, if we need to do this in the normal way, we 
    //need to get the logined-in username, and send a http request to "../v1/user?q=[username]", and get the uuid of this user (this TrumpPatient). 
    //"include_invalidated=true" means we want to get all the patientassignments which related to this user, including invalidated assignments (deleted ones). 
    $http.get(OpenmrsTrumpUrl + "/v1/trumpmodule/patientassignment?assigned_user_id=73efdf58-7979-4da2-bc01-8ee613062b68&include_invalidated=true")
    .success(function(data){
        //the uuid of this patient from openmrs which is linked to TrumpPatient. 
        $scope.patient.uuid = data.results[0].display.substr(10,36);

        //according to the patient uuid, get the patientassignments related to this patient . 
        $http.get(OpenmrsTrumpUrl + "/v1/trumpmodule/patientassignment?patientuuid="+$scope.patient.uuid+"&include_invalidated=true")
        .success(function(paData){
          for(var i = 0; i < paData.results.length; i++){
            // this doctor.id is actually the uuid of the assigned-user, which can be the TrumpPatient and Doctors
            $scope.doctor.id = paData.results[i].display.substr(83,84).substr(0,36);

            // if the id is the id of the TrumpPatient, we dont need to use this result, because this assignment only used to link the patient from openmrs to TrumpPatient. 
            // we only need the ones which related to Doctors. 
            if($scope.doctor.id != "73efdf58-7979-4da2-bc01-8ee613062b68"){
              console.log($scope.doctor.id);

              //get the doctor information according to the doctor.id (which is from patientassignment, and it actually is the uuid of the doctor.)
              $http.get(OpenmrsTrumpUrl + "/v1/user/"+$scope.doctor.id)
              .success(function(doData){
                console.log(doData);
                //give this result to $scope.doctor for showing details of my doctor in "doctors.html", we do not to show much detail of doctors to patients. 
                $scope.doctor = doData;

                $scope.doctors.push($scope.doctor);
                console.log($scope.doctors);
              })
            }           
          } 
        })
    })
    console.log('PatientListCtrl');
})



  .controller('MyDetailCtrl', function($state, $scope,$http, OpenmrsTrumpUrl){
    $scope.myDetail = [];
    $scope.patient = [];

    $http.get(OpenmrsTrumpUrl + "/v1/trumpmodule/patientassignment?assigned_user_id=73efdf58-7979-4da2-bc01-8ee613062b68&include_invalidated=true")
    .success(function(data){
        $scope.patient.uuid = data.results[0].display.substr(10,36);
        $http.get(OpenmrsTrumpUrl + "/v1/patient/"+$scope.patient.uuid)
        .success(function(patientData){
          console.log("mydetail is : ", patientData);
          $scope.myDetail = patientData;

        })
    })
    console.log("current page is : ", $scope.currentPage);

  })



  ;
