var app = angular.module("landingApp", ['ngRoute']);




app.config(function($routeProvider){
	$routeProvider

	.when('/', {
		templateUrl: 'home.html',
		controller: 'mainController'
	})

	.when('/login', {
		templateUrl: 'login.html',
		controller: 'loginController'
	});


});

app.controller("mainController", function($scope) {
    $scope.message = "Home page";
});

app.controller("loginController", function($scope) {
    $scope.message = "login page";
});

