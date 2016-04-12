// Declares the initial angular module "meanMapApp". Module grabs other controllers and services.

var app = angular.module('sharemyride', ['addCtrl', 'queryCtrl', 'headerCtrl', 'geolocation', 'locationservice', 'ngRoute'])

// Configures Angular routing -- showing the relevant view and controller when needed.
    .config(function ($routeProvider) {

        // Join Team Control Panel
        $routeProvider.when('/join', {
            controller: 'addCtrl',
            templateUrl: 'partials/adddrivers.html',

            // Find Teammates Control Panel
        }).when('/search', {
            controller: 'queryCtrl',
            templateUrl: 'partials/searchdrivers.html',

            // All else forward to the Join Team Control Panel
        }).otherwise({ redirectTo: '/search' })
    });
