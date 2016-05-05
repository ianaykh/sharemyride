// Creates the addCtrl Module and Controller. Note that it depends on 'geolocation' and 'locationservice' modules.
var addCtrl = angular.module('addCtrl', ['geolocation', 'locationservice','socketservice']);
addCtrl.controller('addCtrl', function ($scope, $http, $rootScope, geolocation, locationservice,socketservice) {

    // Initializes Variables
    // ----------------------------------------------------------------------------
    $scope.formData = {};
    $scope.loginformData = {};
    var coords = {};
    var lat = 0;
    var long = 0;
    $scope.showLogin = true;
    $scope.showschedule = false;
    $scope.notvaliddriver=false;
    $scope.isavaliddriver=true;
     $scope.showregister=true;
     $scope.seatsfull=false;
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

    $scope.logindriver = function () {

        var driverData = {
            phone: $scope.loginformData.loginphonenumber,
            password: $scope.loginformData.loginpassword
        };
        var config = { params: driverData };

        $http.get('/driverlogin', config)
            .success(function (data) {
                if (data != "no") {
                    $scope.driverid=data._id;
                    $scope.loginformData.phonenumber = "";
                    $scope.loginformData.lastname = "";
                    $scope.dfname = data.firstname;
                    $scope.dlname = data.lastname;
                    $scope.passengerlocations = data.passengers_info;
                    $scope.showschedule = true;
                    $scope.showLogin = false;
                    $scope.showregister=false; 
                    $("#map").remove();
                }
                    
                           
        else{
                  
                    $scope.showLogin = false;
                    $scope.showschedule = false;
                    $scope.notvaliddriver=true;
                    document.getElementById("firstname").focus();
                }

            })
            .error(function (data) {
                console.log(data);
            });
    };
    
    $scope.deletepassengerposition=function(event,driverid){
        
        
        
      $http.put('/deleteposition/'+driverid,event)
      .success(function(successmsg){
          
          console.log(successmsg);
         
          
      })
      .error(function(errormsg){
          console.log(errormsg);
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
            car: [{ Name: $scope.formData.carchoice, capacity: $scope.formData.carcapacity }],
            password:$scope.formData.password,
            location: [$scope.formData.longitude, $scope.formData.latitude],
            htmlverified: $scope.formData.htmlverified,
            phone: $scope.formData.phone
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
                $scope.formData.carcapacity = "";
                $scope.formData.phone = "";

                // Refresh the map with new data
                locationservice.refresh($scope.formData.latitude, $scope.formData.longitude);
                $scope.showLogin = true;
            })
            .error(function (data) {
                console.log('Error: ' + data);
                $("#addPanel").removeClass("panel-success").addClass("panel-danger");
                document.getElementById("addPanelHeading").innerHTML = "Duplicate record exists";
            });
    };
});

