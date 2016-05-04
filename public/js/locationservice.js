// Creates the locationservice factory. This will be the primary means by which we interact with Google Maps
// Dependencies

angular.module('locationservice', ['socketservice'])
    .factory('locationservice', function ($rootScope, $http,socketservice) {

        // Initialize Variables
        // -------------------------------------------------------------
        // Service our factory will return
        var googleMapService = {};
        googleMapService.clickLat = 0;
        googleMapService.clickLong = 0;

        // Array of locations obtained from API calls
        var locations = [];

        // Variables we'll use to help us pan to the right spot
        var lastMarker;
        var currentSelectedMarker;

        // User Selected Location (initialize to center of America)
        var selectedLat = 39.50;
        var selectedLong = -98.35;

        var mapDuplicate, markerDuplicate;


        // Functions
        // --------------------------------------------------------------
        // Refresh the Map with new data. Takes three parameters (lat, long, and filtering results)
        googleMapService.refresh = function (latitude, longitude, filteredResults) {

            // Clears the holding array of locations
            locations = [];

            // Set the selected lat and long equal to the ones provided on the refresh() call
            selectedLat = latitude;
            selectedLong = longitude;

            // If filtered results are provided in the refresh() call...
            if (filteredResults) {

                // Then convert the filtered results into map points.
                locations = convertToMapPoints(filteredResults);

                // Then, initialize the map -- noting that a filter was used (to mark icons yellow)
                initialize(latitude, longitude, true);
            }

            // If no filter is provided in the refresh() call...
            else {

                // Perform an AJAX call to get all of the records in the db.
                $http.get('/user').success(function (response) {

                    // Then convert the results into map points
                    locations = convertToMapPoints(response);

                    // Then initialize the map -- noting that no filter was used.
                    initialize(latitude, longitude, false);
                }).error(function () { });
            }
        };



        // Private Inner Functions
        // --------------------------------------------------------------

        // Convert a JSON of users into map points
        var convertToMapPoints = function (response) {

            // Clear the locations holder
            var locations = [];

            // Loop through all of the JSON entries provided in the response
            for (var i = 0; i < response.length; i++) {
                var user = response[i];

                // Create popup windows for each record
                var contentString = '<p><b>Name</b>: ' + user.firstname + '<br><b>Age</b>: ' + user.age + '<br>' +
                    '<b>Gender</b>: ' + user.gender + '<br><b>Car owned</b>: ' + user.car[0].Name + '</p>';

                // Converts each of the JSON records into Google Maps Location format (Note Lat, Lng format).
                locations.push(new Location(
                    new google.maps.LatLng(user.location[1], user.location[0]),
                    new google.maps.InfoWindow({
                        content: contentString,
                        maxWidth: 400
                    }),
                    user.firstname,
                    user.gender,
                    user.age,
                    user.carchoice
                ))
            }
            // location is now an array populated with records in Google Maps format
            return locations;
        };



        // Constructor for generic location
        var Location = function (latlon, message, firstname, gender, age, carchoice) {
            this.latlon = latlon;
            this.message = message;
            this.firstname = firstname;
            this.gender = gender;
            this.age = age;
            this.carchoice = carchoice;
        };

        var myLocationcontroller = function (myLocationdiv, map, pos) {

            var myLocationUI = document.createElement('div');
            myLocationUI.style.backgroundColor = '#fff';
            myLocationUI.style.border = "2px solid #fff";
            myLocationUI.style.cursor = 'pointer';
            myLocationUI.style.borderRadius = '3px';
            myLocationUI.style.textAlign = 'center';
            myLocationUI.style.boxShadow = '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)';
            myLocationUI.className = 'details';
            myLocationUI.style.textAlign = 'center';
            myLocationUI.style.marginBottom = '22px';
            myLocationUI.style.title = 'click to see your location';
            myLocationdiv.appendChild(myLocationUI);
            var myLocationtext = document.createElement('div');
            myLocationtext.style.color = 'rgb(25,25,25)';
            myLocationtext.style.fontFamily = 'Roboto,Arial,sans-serif';
            myLocationtext.style.fontSize = '16px',
                myLocationtext.style.lineHeight = '38px';
            myLocationtext.style.padding = '5px';
            myLocationtext.innerHTML = "Your location";
            myLocationUI.appendChild(myLocationtext);

            myLocationUI.addEventListener('click', function () {
                map.setZoom(14);
                map.setCenter(pos);
            });

        };

        // Initializes the map
        var initialize = function (latitude, longitude, filter) {

            // Uses the selected lat, long as starting point
            var myLatLng = { lat: parseFloat(selectedLat), lng: parseFloat(selectedLong) };


            // If map has not been created...
            if (!map) {

                // Create a new map and place in the index.html page
                var map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 15,
                    panControl: true,
                    zoomControl: true,
                    mapTypeControl: true,
                    scaleControl: true,
                    streetViewControl: true,
                    overviewMapControl: true,
                    rotateControl: true,
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    center: myLatLng
                });
                mapDuplicate = map;
            }
            var Homebutton = document.createElement('div');
            var homecontrol = new myLocationcontroller(Homebutton, map, myLatLng);
            Homebutton.index = 1;
            map.controls[google.maps.ControlPosition.TOP_CENTER].push(Homebutton);



            // If a filter was used set the icons yellow, otherwise blue
            if (filter) {
                icon = "http://tropicalfarmsbaptist.church/images/car.png";
            }
            else {
                icon = "https://upload.wikimedia.org/wikipedia/commons/d/de/Map_marker_icon_%E2%80%93_Nicolas_Mollet_%E2%80%93_Car_%E2%80%93_Transportation_%E2%80%93_White.png";
            }

            // Loop through each location in the array and place a marker
            locations.forEach(function (n, i) {
                var marker = new google.maps.Marker({
                    position: n.latlon,
                    map: map,
                    animation: google.maps.Animation.DROP,
                    title: "click to get driver details",
                    icon: icon,
                });

                // For each marker created, add a listener that checks for clicks
                google.maps.event.addListener(marker, 'click', function (e) {
                    map.setZoom(17);
                    map.setCenter(marker.getPosition());
                    // When clicked, open the selected marker's message
                    currentSelectedMarker = n;
                    n.message.open(map, marker);
                });


            });


            // Set initial location as a bouncing red marker
            var initialLocation = new google.maps.LatLng(latitude, longitude);
            var marker = new google.maps.Marker({
                position: initialLocation,
                animation: google.maps.Animation.BOUNCE,
                map: map,
                icon: 'http://maps.google.co.uk/help/maps/streetview/images/flying_man.png'
            });
            lastMarker = marker;

            // Function for moving to a selected location
            map.panTo(new google.maps.LatLng(latitude, longitude));

            // Clicking on the Map moves the bouncing red marker
            google.maps.event.addListener(map, 'click', function (e) {
                var marker = new google.maps.Marker({
                    position: e.latLng,
                    animation: google.maps.Animation.BOUNCE,
                    map: map,
                    icon: 'http://icons.iconarchive.com/icons/icons-land/vista-map-markers/32/Map-Marker-Flag-4-Right-Chartreuse-icon.png'
                });

                // When a new spot is selected, delete the old red bouncing marker
                if (lastMarker) {
                    lastMarker.setMap(null);
                }

                // Create a new red bouncing marker and move to it
                lastMarker = marker;

                map.panTo(marker.position);

                // Update Broadcasted Variable (lets the panels know to change their lat, long values)
                googleMapService.clickLat = marker.getPosition().lat();
                googleMapService.clickLong = marker.getPosition().lng();
                $rootScope.$broadcast("clicked");
            });
        };
        googleMapService.zoomIntoMarkerLink = function (event) {

            var dlat = parseFloat(event.location[1]);
            var dlong = parseFloat(event.location[0]);

            var geocoder = new google.maps.Geocoder;

            var myLatLng = { lat: dlat, lng: dlong };

            geocoder.geocode({ 'location': myLatLng }, function (results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    if (results[0]) {

                        var contentString = '<p>This is : </p>' + event.firstname + '<p> currently is at </p>' + results[0].formatted_address;
                        var infoWindow = new google.maps.InfoWindow({
                            content: contentString
                        });
                        var infolatlng = new google.maps.LatLng({ lat: dlat, lng: dlong });
                        infoWindow.setPosition(infolatlng);



                        mapDuplicate.panTo({ lat: dlat, lng: dlong });
                        infoWindow.open(mapDuplicate, markerDuplicate);

                    }
                    else {
                        alert("Cannot get address");
                    }
                }
            });


        };

        // Refresh the page upon window load. Use the initial latitude and longitude
        google.maps.event.addDomListener(window, 'load',
            googleMapService.refresh(selectedLat, selectedLong));

        return googleMapService;
    });
   


