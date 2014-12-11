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
          controller: 'PatientCtrl'
        }
      }
    })
    .state('tabs.response', {
      url: "/response",
      views: {
        'home-tab': {
          templateUrl: "response.html",
          controller: 'ResponseCtrl'
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

    $scope.patientDetail = {};



    $scope.submit = function(){
      //once signed in , we do not need to add authorization header anymore, because we added it
      //in the beginning when we check username and password. 
      //$http.defaults.headers.common.Authorization = 'Basic ' + btoa('Admin:Admin123');
      
      $http.defaults.useXDomain = true;

      $http.get(OpenmrsTrumpUrl + "/v1/patient?q=john")
      .success(function(data){
        console.log('data', data.results[0]);
        //$scope.objects.push(data.results);
        $scope.responseTextarea = data.results[0].display;
      }).
      error(function(data){
        console.log('data', data);
        $scope.responseTextarea = 'error'});

      //$scope.modal.show();

    }
})

.controller('HomeTabCtrl', function($scope) {

  console.log('HomeTabCtrl');
  
  
})

.controller('ResponseCtrl', function($state, $scope,$http, OpenmrsTrumpUrl){
    $scope.patientDetail = {};

    $http.defaults.useXDomain = true;

// in openmrs rest client, user can send the patientassignment request, but in the policy file, if the user
// is not admin, it will return deny, so we need to add the properties to the url, which means we need to 
// have the user's information ?????!!!!
      $http.get(OpenmrsTrumpUrl + "/v1/patient")
      .success(function(data){
        $scope.patient.display = data.results[0].display;
        console.log('data', data.results[0]);
        
      }); 

})

.controller('PatientCtrl', function($state, $scope,$http, OpenmrsTrumpUrl) {

  // 1. have some lunch

  // if(lunch) {
  // make request now for the list of assigned patients
  // you don't need the user (doctor) ID because OpenMRS knows 
  // who you are because you are logged in, right? Right? Anita? Ok.

  // then just stick the result on the scope and deal with it back in the 
  // HTML file }
 
  $scope.patientNames = [];
  $scope.patient = {};

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
          $scope.patient.uuid = data.results[i].display.substr(10,36);

          $http.get(OpenmrsTrumpUrl + "/v1/patient/"+$scope.patient.uuid)

          .success(function(patientData){
              $scope.patient.name = patientData.display;

              if($scope.patientNames.indexOf($scope.patient.name) < 0){
                $scope.patientNames.push($scope.patient.name);
              }

              console.log('patientdata', patientData.display);   
          });

          console.log(i+":" , $scope.patient.uuid); 

        }

        console.log('data', data.results[0]);      
      });   

  
  console.log('PatientCtrl');

  $scope.showDetail = function(){
     $state.go('tabs.request');
  }
  
  
});
