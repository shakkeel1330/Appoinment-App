var app = angular.module("appointmentApp", ['ngRoute']);




app.config(function($routeProvider){
	$routeProvider

	.when('/', {
		templateUrl: 'home.html',
		controller: 'homeController'
	})

	.when('/login', {
		templateUrl: 'logout.html',
		controller: 'logoutController'
	})

	.when('/members', {
		templateUrl: 'members.html',
		controller: 'membersController'
	})

	.when('/appointment', {
		templateUrl: 'appointment.html',
		controller: 'appointmentController'
	});


});

app.controller("homeController", function($scope) {
    $scope.message = "Home page";
});

app.controller("loginController", function($scope) {
    $scope.message = "login page";
});

app.controller("memberController", function($scope) {
    $scope.message = "Members list";
});

app.controller("appointmentController", function($scope) {
    $scope.message = "Calendar page";
});