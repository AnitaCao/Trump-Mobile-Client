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
    return { 
      setPatientsDetails : function(patientsDetails){
        this.patientsDetails = patientsDetails;
      },
      getPatientsDetails : function(){
        return patientsDetails;
      },


      // setPatientNames : function(patientNames){
      //   this.patientNames = patientNames;
      // },
      // getPatientNames : function(){
      //   return patientNames;
      // },

      addPatientsDetails : function(patientDetail){
        patientsDetails.push(patientDetail); 
        return patientsDetails;  
      }
      //,

      // addPatientNames : function(patientName){
      //   patientNames.push(patientName);
      //   return patientNames;
      // }
    }
  })

  .constant('OpenmrsTrumpUrl','http://localhost:8080/openmrs/ws/rest')

  .controller('SignInCtrl', function($scope, $state,$http,OpenmrsTrumpUrl) {
    $scope.user = {};
    $scope.signIn = function() {
   
      console.log('Sign-In', $scope.user);

      if($scope.user.username != null && $scope.user.password != null){

        $http.defaults.headers.common.Authorization = 'Basic ' + btoa($scope.user.username + ':' +$scope.user.password);

        $http.defaults.useXDomain = true;

        $http.get(OpenmrsTrumpUrl + "/v1/concept/")
        .success(function(data){
          $state.go('tabs.home');
        }).
        error(function(data){
           alert('Incorrect Password or Username, Please Re-enter!');
        });     
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

  .controller('HomeTabCtrl', function($scope) {

    console.log('HomeTabCtrl');
    
  })

  .controller('PatientDetailCtrl', function($state, $scope,$http, OpenmrsTrumpUrl, myFactory, $location){
    $scope.patientDetail = [];

    $scope.showPatientDetail = myFactory;


    $scope.currentPage = $location.search().v;
    $scope.patientDetail = ($scope.showPatientDetail.getPatientsDetails()[$scope.currentPage]);
    //$scope.patientDetail.name = $scope.patientDetail.display;

    //$scope.patientDetail.gender = $scope.patientDetail.get("display");


    console.log("current page is : ", $scope.currentPage);

    console.log("PatientDetail in response page : " , $scope.showPatientDetail.getPatientsDetails()[$scope.currentPage]);



  })

  .controller('PatientListCtrl', function($state, $scope,$http, OpenmrsTrumpUrl, myFactory) {

    $scope.patientDetail = myFactory;
    $scope.patientDetail.setPatientsDetails([]);
    

    $scope.patientNames = [];
    $scope.patient = {};
    $scope.patientuuids = [];
    //myFactory.patientsDetails = [];
    //myFactory.patientNames = [];

    $http.defaults.useXDomain = true;

  // in openmrs rest client, user can send the patientassignment request, but in the policy file, if the user
  // is not admin, it will return deny, so we need to add the properties to the url, which means we need to 
  // have the user's information ?????!!!!

      // here's what I would do (Chris) - this might be stupid, 34% chance of being stupid
      // do the initial request to get the list of assignments, should return an array
      // for each element, do another request for the patient's details using UUID/ID
      // store the patient's details (not perhaps necessary but will be more efficient)
      // you want to create a map of UUID to patient name and return this to the view (just in case there are more than one patient with same name, you couldn't use that as a key)

      // the way to share data between controllers statefully is by defining a thing called a service. Angluar JS seems to want the "model" to be 
      // tied completely to a controller using scopes. If you want to share things (like, for example, you've downloaded all this data by doing a patientassignment
       // search and now you want to show the details in another controller) it's better to define it like a service. This might make it easier to 
      // have a page with a list of things to choose from that then takes you to a page of detail. If we try to do this manually we might be wasting effort, maybe AngularJS will help us
      // so look at that documentation 

    $http.get(OpenmrsTrumpUrl + "/v1/trumpmodule/patientassignment?doctorid=3&include_invalidated=true")
    .success(function(data){
      for(var i = 0; i < data.results.length; i++){
        // get the patient uuid from the results which are patientAssignments. The uuid of patient is inside the 
        // display value. 
        $scope.patient.uuid = data.results[i].display.substr(10,36);

        if($scope.patientuuids.indexOf($scope.patient.uuid) < 0){
            $scope.patientuuids.push($scope.patient.uuid);

            //send another request to get the patient which assigned to the doctor
            $http.get(OpenmrsTrumpUrl + "/v1/patient/"+$scope.patient.uuid)
            .success(function(patientData){
                // the patient.name is actually not just the name, it also contain the openmrs kind of Id (such as "100-8")
                $scope.patient.name = patientData.display;

                if($scope.patientDetail.getPatientsDetails().indexOf(patientData) < 0){
                  //myFactory.patientsDetails.push(patientData);
                  $scope.patientDetail.setPatientsDetails($scope.patientDetail.addPatientsDetails(patientData));
                }                   
                console.log("patientsDetails 1 : ", $scope.patientDetail.getPatientsDetails());

                // push the patient names to the patientNames list for showing them use ng-repeat in paitent.html page, 
                // and get ride of duplicated item. 
                if($scope.patientNames.indexOf($scope.patient.name) < 0){
                  $scope.patientNames.push($scope.patient.name);
                }

              
                //$scope.patientDetail.setPatientNames($scope.patientNames);
          

                console.log('patientdata', patientData.display);   
            });
            console.log(i+":" , $scope.patient.uuid); 
        }

      }
      //myFactory.patientNames = $scope.patientNames;
      //console.log('data', data.results[0]);    
      
    });  
    console.log('PatientListCtrl');


  });
