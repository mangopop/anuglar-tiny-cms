var app = angular.module('myApp', ['ui.tinymce', 'firebase', 'ui.router', 'ngSanitize', 'ui-notification']);
app.run(["$rootScope", "$state", function ($rootScope, $state) {
    $rootScope.$on("$stateChangeError", function (event, toState, toParams, fromState, fromParams, error) {
        // We can catch the error thrown when the $requireAuth promise is rejected
        // and redirect the user back to the home page
        if (error === "AUTH_REQUIRED") {
            $state.go("home");
        }
    });
}]);

app.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {

    // For any unmatched url, redirect to /home
    $urlRouterProvider.otherwise("/home");

    // Now set up the states
    $stateProvider
        .state('home', {
            url: "/home",
            templateUrl: "partials/home.html",
            controller: 'HomeController',
            resolve: {
                // controller will not be loaded until $waitForAuth resolves
                // Auth refers to our $firebaseAuth wrapper in the example above
                "currentAuth": ["Auth", function (Auth) {
                    // $waitForAuth returns a promise so the resolve waits for it to complete
                    return Auth.$waitForAuth();
                }]
            }
        })
        .state('login', {
            url: "/login",
            templateUrl: "partials/login.html",
            controller: 'LoginController',
            resolve: {
                // controller will not be loaded until $waitForAuth resolves
                // Auth refers to our $firebaseAuth wrapper in the example above
                "currentAuth": ["Auth", function (Auth) {
                    // $waitForAuth returns a promise so the resolve waits for it to complete
                    return Auth.$waitForAuth();
                }]
            }
        })
        .state('edit', {
            url: "/edit",
            templateUrl: "partials/edit.html",
            controller: 'EditController',
            resolve: {
                // controller will not be loaded until $requireAuth resolves
                // Auth refers to our $firebaseAuth wrapper in the example above
                "currentAuth": ["Auth", function (Auth) {
                    // $requireAuth returns a promise so the resolve waits for it to complete
                    // If the promise is rejected, it will throw a $stateChangeError (see above)
                    return Auth.$requireAuth();
                }]
            },
            data: {
                protected: true
            }
        });
    // $locationProvider.html5Mode(true); //need to do server side re-writes https://github.com/angular-ui/ui-router/wiki/Frequently-Asked-Questions#how-to-configure-your-server-to-work-with-html5mode
});

// app.run(['$rootScope', 'Auth', function($rootScope, Auth) {
// // track status of authentication
// Auth.$onAuth(function(user) {
//     $rootScope.loggedIn = !!user;
// });

//http://stackoverflow.com/questions/20663076/angularjs-app-run-documentation
//works but trying a different way
// app.run(function($rootScope, $state) {
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


//this will return fireBaseAuth
app.factory("Auth", ["$firebaseAuth",
    function ($firebaseAuth) {
        var ref = new Firebase("https://torrid-inferno-1621.firebaseio.com", "example3");
        return $firebaseAuth(ref);
    }
]);

app.controller('MainController', function ($scope, Auth, $firebaseObject, Notification) {
    var ref = new Firebase("https://torrid-inferno-1621.firebaseio.com");
    $scope.data = $firebaseObject(ref);
    // $scope.authData = Auth.$getAuth();
        // any time auth status updates, add the user data to scope
    Auth.$onAuth(function (authData) {
        $scope.authData = authData;
    });
    // $rootScope.authData = Auth.$getAuth();
    //logout
    $scope.logout = function () {
        //When logout is called, the $onAuth() callback(s) will be fired.
        Auth.$unauth();
        // $scope.authData.$unauth();
        console.log($scope.authData);

        if($scope.authData){
            Notification.success('Successfully logged out');
        }else{
            Notification.error('failed to log out');
        }
    };

});

app.controller('HomeController', function ($scope, currentAuth, $firebaseObject) {
    var ref = new Firebase("https://torrid-inferno-1621.firebaseio.com");
    $scope.data = $firebaseObject(ref);
    //assign db data to scope
    $scope.homeData = $firebaseObject(ref.child('homeSection'));

});

app.controller('LoginController', function ($scope, $rootScope,currentAuth, Auth, $firebaseObject, Notification) {
    var ref = new Firebase("https://torrid-inferno-1621.firebaseio.com");
    $scope.data = $firebaseObject(ref);
    $scope.user = {};
    $scope.user.loggedIn = false;
    $scope.user.loggedInMessage = '';    
    $scope.authData;
    
    //TODO hide the login button depending on state
    
    // pass this as factory instead
    // var auth = $firebaseAuth(ref); //angular version
    // $scope.authObj = $firebaseAuth(ref); //angular version
    $scope.auth = Auth;

    // var authData = ref.getAuth();

    // ***************** login **********************//
    //login
    $scope.login = function (user) {
        Auth.$authWithPassword({ //could use Auth.$authWithPassword?
            email: user.email,
            password: user.password
        }).then(function (authData) {
            console.log("Logged in as:", authData.uid);
            Notification.success('Successfully logged in');
        }).catch(function (error) {
            console.error("Authentication failed:", error);
            Notification.error('Failed to log out');
        });
    };

    //logout
    // $scope.logout = function () {
    //     //When logout is called, the $onAuth() callback(s) will be fired.
    //     Auth.$unauth();
    //     // $scope.authData.$unauth();
    //     console.log($scope.authData);

    //     // if($scope.auth === null){
    //     //     Notification.success('Successfully logged out');
    //     // }else{
    //     //     Notification.error('failed to log out');
    //     // }
    // };
    
    // $scope.authData = Auth.$getAuth();
    // $rootScope.authData = Auth.$getAuth();

    // if ($scope.authData) {
    //     console.log("Logged in as:", $scope.authData.uid);
    // } else {
    //     console.log("Logged out");
    // }

    // any time auth status updates, add the user data to scope
    // Auth.$onAuth(function (authData) {
    //     $scope.authData = authData;
    // });

    //non angular fire stuff
    // $scope.data = angular.fromJson($firebaseObject(ref));
    // var obj = new $firebaseObject(ref);
    // obj.$loaded().then(function() {
    //   $scope.tinymceModel = obj.contactSection.section1;
    //   console.log(obj.contactSection.section1);
    // });

});


app.controller('EditController', function ($scope, $timeout, currentAuth, $firebaseObject, $firebaseAuth, Notification, Auth) {
var ref = new Firebase("https://torrid-inferno-1621.firebaseio.com");

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


