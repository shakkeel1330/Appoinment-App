var app = angular.module("appointmentApp", ['ngRoute']);




app.config(function($routeProvider){
	$routeProvider

	.when('/', {
		templateUrl: 'default.html',
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

	.when('/calendar', {
		templateUrl: 'calendar.html',
		controller: 'calendarController'
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

app.controller("membersController", function($scope) {
    $scope.message = "Members list";
});

app.controller("calendarController", function($scope) {
    $scope.message = "Calendar page";
});

app.controller("appointmentController", function($scope) {
    $scope.message = "Appointment page";
});