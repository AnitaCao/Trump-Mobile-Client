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
          controller: 'RequestCtrl'
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

.controller('PatientCtrl', function($scope) {

  console.log('PatientCtrl');
  
  
});
