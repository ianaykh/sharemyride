// Creates the addCtrl Module and Controller. Note that it depends on 'geolocation' and 'locationservice' modules.
var addCtrl = angular.module('addCtrl', ['geolocation', 'locationservice']);
addCtrl.controller('addCtrl', function ($scope, $http, $rootScope, geolocation, locationservice) {
    
    // Initializes Variables
    // ----------------------------------------------------------------------------
    $scope.formData = {};
    var coords = {};
    var lat = 0;
    var long = 0;
    $scope.showLogin=false;
    // Set initial coordinates to the center of the US
    $scope.formData.longitude = -98.350;
    $scope.formData.latitude = 39.500;

    // Get User's actual coordinates based on HTML5 at window load
    geolocation.getLocation().then(function (data) {

        // Set the latitude and longitude equal to the HTML5 coordinates
        coords = { lat: data.coords.latitude, long: data.coords.longitude };

        // Display coordinates in location textboxes rounded to three decimal points
        $scope.formData.longitude = parseFloat(coords.long).toFixed(3);
        $scope.formData.latitude = parseFloat(coords.lat).toFixed(3);

        // Display message confirming that the coordinates verified.
        $scope.formData.htmlverified = "Location Received";

        locationservice.refresh($scope.formData.latitude, $scope.formData.longitude);

    });

    // Functions
    // ----------------------------------------------------------------------------

    // Get coordinates based on mouse click. When a click event is detected....
    $rootScope.$on("clicked", function () {

        // Run the locationservice functions associated with identifying coordinates
        $scope.$apply(function () {
            $scope.formData.latitude = parseFloat(locationservice.clickLat).toFixed(3);
            $scope.formData.longitude = parseFloat(locationservice.clickLong).toFixed(3);
            $scope.formData.htmlverified = "Location cannot be detected";
        });
    });

    // Function for refreshing the HTML5 verified location (used by refresh button)
    $scope.refreshLoc = function () {
        geolocation.getLocation().then(function (data) {
            coords = { lat: data.coords.latitude, long: data.coords.longitude };

            $scope.formData.longitude = parseFloat(coords.long).toFixed(3);
            $scope.formData.latitude = parseFloat(coords.lat).toFixed(3);
            $scope.formData.htmlverified = "Location Received";
            locationservice.refresh(coords.lat, coords.long);
        });
    };



    // Creates a new user based on the form fields
    $scope.createUser = function () {

        // Grabs all of the text box fields
        var userData = {
            firstname: $scope.formData.firstname,
            lastname: $scope.formData.lastname,
            gender: $scope.formData.gender,
            age: $scope.formData.age,
            car: [{Name:$scope.formData.carchoice,capacity:$scope.formData.carcapacity}],
            location: [$scope.formData.longitude, $scope.formData.latitude],
            htmlverified: $scope.formData.htmlverified,
            phone:$scope.formData.phone
        };

        // Saves the user data to the db
        $http.post('/user', userData)
            .success(function (data) {

                // Once complete, clear the form (except location)
                $scope.formData.firstname = "";
                $scope.formData.lastname = "";
                $scope.formData.gender = "";
                $scope.formData.age = "";
                $scope.formData.carchoice = "";
                $scope.formData.carcapacity="";
                $scope.formData.phone="";

                // Refresh the map with new data
                locationservice.refresh($scope.formData.latitude, $scope.formData.longitude);
                $scope.showLogin=true;
            })
            .error(function (data) {
                console.log('Error: ' + data);
                $("#addPanel").removeClass("panel-success").addClass("panel-danger");
                document.getElementById("addPanelHeading").innerHTML="Duplicate record exists";
            });
    };
});

