var myAppModule = angular.module('myApp', ['ui.tinymce','firebase']);

myAppModule.controller('TinyMceController', function($scope,$firebaseObject) {
  var ref = new Firebase("https://torrid-inferno-1621.firebaseio.com");
  $scope.data = $firebaseObject(ref);
  // $scope.data = angular.fromJson($firebaseObject(ref));
  
  // var obj = new $firebaseObject(ref);
  // obj.$loaded().then(function() {
  //   $scope.tinymceModel = obj.contactSection.section1;
  //   console.log(obj.contactSection.section1);
  // });

  $scope.tinymceModel = $firebaseObject(ref.child('contactSection'));
  $scope.tinymceModel2 = 'Initial2 content'

  $scope.getContent = function() {
    console.log('Editor content:', $scope.tinymceModel);
  };

  $scope.setContent = function() {
    $scope.tinymceModel = 'Time: ' + (new Date());
  };

  $scope.tinymceOptions = {
    plugins: 'link image code',
    toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | code'
  };
});


