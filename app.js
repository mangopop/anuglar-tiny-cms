var myAppModule = angular.module('myApp', ['ui.tinymce', 'firebase', 'ui.router', 'ngSanitize', 'ui-notification']);

myAppModule.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {

    // For any unmatched url, redirect to /home
    $urlRouterProvider.otherwise("/home");

    // Now set up the states
    $stateProvider
        .state('home', {
            url: "/home",
            templateUrl: "partials/home.html",
            controller: 'HomeController'
        })
        .state('edit', {
            url: "/edit",
            templateUrl: "partials/edit.html",
            controller: 'EditController',
            data: {
                protected: true
            }
        });
    // $locationProvider.html5Mode(true); //need to do server side re-writes https://github.com/angular-ui/ui-router/wiki/Frequently-Asked-Questions#how-to-configure-your-server-to-work-with-html5mode
});
//http://stackoverflow.com/questions/20663076/angularjs-app-run-documentation
//works but trying a different way
// myAppModule.run(function($rootScope, $state) {
//     $rootScope.$on('$stateChangeStart', function(e, to) {
//         console.log(to);
//         var notLoggedIn = true;
//         // if (!angular.isFunction(to.data.loggedIn)) return;
//         var ref = new Firebase("https://torrid-inferno-1621.firebaseio.com");
//         //TODO service
//         function authDataCallback(authData) {
//             if (authData) {
//                 console.log("User " + authData.uid + " is logged in with " + authData.provider);
//                 notLoggedIn = false;
//             } else {
//                 console.log("User is logged out");
//                 notLoggedIn = true;
//             }
//         }
//         ref.onAuth(authDataCallback);
//
//         if (to.data && to.data.protected && notLoggedIn) {
//             e.preventDefault();
//             // Optionally set option.notify to false if you don't want
//             // to retrigger another $stateChangeStart event
//             $state.go('home');
//             // $state.go(result.to, result.params, {notify: false});
//         }
//     });
// });

myAppModule.controller('HomeController', function ($scope, $firebaseObject) {
    var ref = new Firebase("https://torrid-inferno-1621.firebaseio.com");
    $scope.data = $firebaseObject(ref);
    $scope.homeData = $firebaseObject(ref.child('homeSection'));

});

myAppModule.controller('EditController', function ($scope, $timeout, $firebaseObject, Notification) {
    var ref = new Firebase("https://torrid-inferno-1621.firebaseio.com");
    $scope.data = $firebaseObject(ref);
    $scope.user = {};
    $scope.user.loggedIn = false;
    $scope.user.loggedInMessage = '';
    var authData = ref.getAuth();

    // ***************** login **********************//

    $scope.login = function(user){
        // Or with an email/password combination
        ref.authWithPassword({
            email    : user.email,
            password : user.password
        }, authHandler);

    };

    //logout
    $scope.logout = function(){
        ref.unauth();
        console.log(authData);
        //this doesn't work not timeout issue
        $timeout(function(){
            if(authData === null){
                Notification.success('Successfully logged out');
            }else{
                Notification.error('failed to log out');
            }
        },500)

    };

    // Create a callback which logs the current auth state
    function authDataCallback(authData) {
        if (authData) {
            console.log("User " + authData.uid + " is logged in with " + authData.provider);
            console.log(authData.auth.token.email);
            $scope.user.savedEmail = authData.auth.token.email;
            $scope.user.loggedIn = true;
            $scope.user.message = 'You are logged in as '+$scope.user.savedEmail;
        } else {
            console.log("User is logged out");
            $scope.user.loggedIn = false;
            $scope.user.message = 'You are not logged in';
        }
    }
    ref.onAuth(authDataCallback);

    // Create a callback to handle the result of the authentication
    function authHandler(error, authData) {
        if (error) {
            console.log("Login Failed!", error);
            Notification.error('failed to log in');
        } else {
            console.log("Authenticated successfully with payload:", $scope.user.savedEmail);
            Notification.success('Successfully logged in');
        }
    }


    // $scope.data = angular.fromJson($firebaseObject(ref));

    // var obj = new $firebaseObject(ref);
    // obj.$loaded().then(function() {
    //   $scope.tinymceModel = obj.contactSection.section1;
    //   console.log(obj.contactSection.section1);
    // });

    $scope.tinymceModel = $firebaseObject(ref.child('homeSection'));
    $scope.tinymceModel2 = 'Initial2 content';

    $scope.saveModel = function () {
        $scope.tinymceModel.$save().then(function () {
            Notification.success('Success notification');
        }).catch(function (error) {
            Notification.success('Error notification');
        });
    };


    // $scope.getContent = function () {
    //     console.log('Editor content:', $scope.tinymceModel);
    // };
    //
    // $scope.setContent = function () {
    //     $scope.tinymceModel = 'Time: ' + (new Date());
    // };

    $scope.tinymceOptions = {
        plugins: 'link image code',
        toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | code'
    };
});


