// Creates the addCtrl Module and Controller. Note that it depends on 'geolocation' and 'locationservice' modules.
var queryCtrl = angular.module('queryCtrl', ['geolocation', 'locationservice']);
queryCtrl.controller('queryCtrl', function($scope, $log, $http, $rootScope, geolocation, locationservice) {

    // Initializes Variables
    // ----------------------------------------------------------------------------
    $scope.formData = {};
    var queryBody = {};
    $scope.showlocationsent = false;



    $scope.showdriverlocationonmap = function(event) {
        console.debug(event);

        var myLatLng = { lat: parseFloat(event.location[0]), lng: parseFloat(event.location[1]) };


        locationservice.zoomIntoMarkerLink(event);
        


    };

    $scope.sendMyLocation = function(event) {
        var geocoder = new google.maps.Geocoder;

        var myLatLng = { lat: parseFloat($scope.formData.latitude), lng: parseFloat($scope.formData.longitude) };

        geocoder.geocode({ 'location': myLatLng }, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                if (results[0]) {

                    $scope.$apply(function() {
                        $scope.showlocationsent = true;
                        $scope.driverfname = event.firstname;
                        $scope.driverlname = event.lastname;
                        $scope.phonenumberdriver = event.phone;
                        $scope.locationstring = results[0].formatted_address;

                    });
                }
                else {
                    alert(status);
                }
            }

        });

    }
    // Functions
    // ----------------------------------------------------------------------------

    // Get User's actual coordinates based on HTML5 at window load
    geolocation.getLocation().then(function(data) {
        coords = { lat: data.coords.latitude, long: data.coords.longitude };

        // Set the latitude and longitude equal to the HTML5 coordinates
        $scope.formData.longitude = parseFloat(coords.long).toFixed(3);
        $scope.formData.latitude = parseFloat(coords.lat).toFixed(3);
    });

    // Get coordinates based on mouse click. When a click event is detected....
    $rootScope.$on("clicked", function() {

        // Run the locationservice functions associated with identifying coordinates
        $scope.$apply(function() {
            $scope.formData.latitude = parseFloat(locationservice.clickLat).toFixed(3);
            $scope.formData.longitude = parseFloat(locationservice.clickLong).toFixed(3);
        });
    });

    // Take query parameters and incorporate into a JSON queryBody
    $scope.queryUsers = function() {
        $scope.showlocationsent = false;
        // Assemble Query Body
        queryBody = {
            longitude: parseFloat($scope.formData.longitude),
            latitude: parseFloat($scope.formData.latitude),
            distance: parseFloat($scope.formData.distance),
            male: $scope.formData.male,
            female: $scope.formData.female,
            other: $scope.formData.other,
            minAge: $scope.formData.minage,
            maxAge: $scope.formData.maxage,
            carchoice: $scope.formData.carchoice,
            reqVerified: $scope.formData.verified
        };

        // Post the queryBody to the /query POST route to retrieve the filtered results
        $http.post('/search', queryBody)

            // Store the filtered results in queryResults
            .success(function(queryResults) {

                // Pass the filtered results to the Google Map Service and refresh the map
                locationservice.refresh(queryBody.latitude, queryBody.longitude, queryResults);

                // Count the number of records retrieved for the panel-footer
                $scope.queryCount = queryResults.length;
                $scope.results = queryResults;

            })
            .error(function(queryResults) {
                console.log('Error ' + queryResults);
            })
    };


    // Get User's actual coordinates based on HTML5 at window load
    geolocation.getLocation().then(function(data) {

        // Set the latitude and longitude equal to the HTML5 coordinates
        coords = { lat: data.coords.latitude, long: data.coords.longitude };

        // Display coordinates in location textboxes rounded to three decimal points
        $scope.formData.longitude = parseFloat(coords.long).toFixed(3);
        $scope.formData.latitude = parseFloat(coords.lat).toFixed(3);

        // Display message confirming that the coordinates verified.
        $scope.formData.htmlverified = "Location Received";

        locationservice.refresh($scope.formData.latitude, $scope.formData.longitude);

    });




});

