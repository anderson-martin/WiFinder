angular.module('myApp', []);

var myController2 = function($scope){
    $scope.myInput = "world";
};

angular
    .module('myApp')
    .controller('myController', myController2);