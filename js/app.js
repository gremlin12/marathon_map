/* Marathon Map */

/* Model */

//   Custom locations can be added independently of Google Places by adding data manually
//   to the model. The custom category "beaches" has been added as an example.

var model = [    
     {
        name : 'Sombrero Beach',
        lat : 24.691533,
        long : -81.086107,
        cat : ['beaches','parks'],
        imgUrl : '',
        address : 'Sombrero Beach Rd., Marathon',
        placeid : '001',
        website : 'http://www.ci.marathon.fl.us/government/parks/city-parks-and-beaches/',
        phoneNumber : '(305) 743-0033'
     },
     {
        name : 'Coco Plum Beach',
        lat : 24.730240,
        long : -81.001592,
        cat : ['beaches', 'parks'],
        imgUrl : '',
        address : 'Coco Plum Dr., Marathon',
        placeid : '002',
        website : 'http://www.ci.marathon.fl.us/government/parks/city-parks-and-beaches/',
        phoneNumber : '(305) 743-0033'
     }
];


/* Google Map View */


// Set up Google Map. Define these variables globally for use in several functions.

var map = new google.maps.Map(document.getElementById('map-canvas'), {
        zoom: 12,
        center: mapCenter//{lat: 24.723009, lng: -81.038884}
    }); 

//To customize for a different city or neighborhood, change these lat/long coordinates.
//var mapCenter = new google.maps.LatLng(24.723009, -81.038884);
var mapCenter = new google.maps.LatLng(52.366667, 4.9);


var markers = [];
var marker;
var request;
var service = new google.maps.places.PlacesService(map);
var infowindow = new google.maps.InfoWindow();
var infoWindowIsOpen = false;


view = {

    // Check width of map to determine which labels to use on navigation menu.
    // Smaller mobile devices will use icons for menu tabs. 

    init : function() {
        var categories = ['hospitality', 'culture', 'recreation', 'government', 'services'];
        var icons = ['&#9789;', '&#9774;', '&#9786;', '&#10026;', '&#36;'];
        var labels = ['Hospitality ', 'Culture ', 'Recreation ', 'Government ', 'Services '];
        for (i=0; i < categories.length; i++) {
            if ($('#map-canvas').width() > 570)  {  
                $( '#' + categories[i] ).replaceWith( '<a href="#" id=' + categories[i] +'>' + labels[i] + '&#9660;' +'</a>' );
                $('#' + categories[i] ).css('text-align', 'left');
            } else {
                $( '#' + categories[i] ).replaceWith( '<a href="#" id=' + categories[i] + '>' + icons[i]  + '</a>' );  
                $('#' + categories[i] ).css('text-align', 'center');
                $('#' + categories[i] ).css('line-height', '30px');
            } 
        }
    }, 
    
    // Send a Places Search request to Google when a category tab is clicked in navigation menu. 
    getLocations : function (category) {
        var request = {
            location: map.center,
            radius: '20000',
            types: [category]
        };
        service.nearbySearch(request, callback);
        
        // Callback function returns Places Search results.
        // Loop through results and send the data for each place to the createMarker() function.

        function callback(results, status) {  
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                for (var i = 0; i < results.length; i++) {
                    var place = results[i];
                    createMarker(results[i]);
                }
            }
        }

        /* This function collects and saves the data needed to create a marker for each place.
           Later, the data will be used by the addMarkers() function to place markers on the map.
           Details of each place are saved to the model and to the locations array. */

        function createMarker(place) {
            var name = place.name;
            var lat = place.geometry.location.lat();
            var long = place.geometry.location.lng();
            var address = place.vicinity;
            var cat = request.types;
            var imgUrl = '';
            var placeid = place.place_id;

            // Check if a photo was found by the Places Search before saving as var imgUrl.
            // If no photo exists, imgUrl =''.

            if (place.hasOwnProperty('photos') ) {
                imgUrl = place.photos[0].getUrl({'maxWidth':100, 'maxHeight':100});
            }

            /* Details of each place are saved as a new Location object (see viewModel) and placed
              in the locations array. The locations array holds basically the same information as 
              the markers array, but it is ko.observable and needed to make the model-view-viewModel 
              system work. */

            locations.push(new Location(name,lat,long,cat,address,imgUrl,placeid));

            /* Place details are also added to the model. This makes it possible to search
             for locations after the markers have been removed from the map. It also allows for 
             custom locations to be created independently of Google's API. */

            var obj = {
                name : name,
                lat : lat,
                long : long,
                cat : cat,
                address : address,
                imgUrl : imgUrl,
                placeid : placeid
            }

            model.push(obj);
        }  
    },

    /* Add a marker to the map for each place, using data prepared by 
       the createMarker() function above. The addMarkers() function
       is triggered each time a new Location object is added to the 
       locations array. */

    addMarkers : function(name,lat,long,cat,address,imgUrl,placeid) {
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, long),
            name: name,
            map : map,
            cat : cat,
            address : address,
            imgUrl : imgUrl,
            placeid : placeid
        });
        
        // Make each marker clickable. The click event triggers a series
        // functions to add content to the infowindow and open it.
        google.maps.event.addListener(marker, 'click', (function(marker) {
            return function() {
            view.sortClickedMarkers(placeid);
            };
        })(marker)); 
    
        // Each marker's data is saved as a json in the markers array.    
        markers.push(marker);
    },
    
    /* The getPlaceDetails() function is triggered when the user clicks on a location name
       rendered in the results area. It sends an additional request to Google for more
       detailed information about the location. The phone number, website, and Google place_id 
       are collected and saved from the returned results, and these data are passed on to the 
       openInfoWindow() function in the viewModel.  */
       
    getPlaceDetails: function (placeid) {
        var phoneNumber ='';
        var website = '';
    
        var request = {
            placeId : placeid()
        }
        service.getDetails(request, callback);
        function callback(place, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                var name = place.name;
                phoneNumber = place.formatted_phone_number;
                website = place.website;
                placeid = place.place_id;
                openInfoWindow(phoneNumber, placeid, website);
            }            
           
        }
    },
    
    /* The next two functions are triggered when a user clicks on a map-marker. The function
       sortClickedMarkers() checks whether the clicked marker represents a custom location  
       from the model or a Google Places location delivered by Google's API. If the marker 
       belongs to a Google location, getClickedPlaceDetails() is called. If it belongs 
       to a custom location, the phone number and website URL are collected from the model and 
       sent straight to the openInfoWindow() function. */

    sortClickedMarkers : function (placeid) {
        // A Google place-id must be 27 characters in length.
        if (ko.utils.unwrapObservable(placeid).length > 6) {
            view.getClickedPlaceDetails(placeid);
        }
        else {
            for (var place in model) {
                if (model[place].placeid === ko.utils.unwrapObservable(placeid)) {
                    var phoneNumber = model[place].phoneNumber;
                    var website = model[place].website;
                    openInfoWindow(phoneNumber, ko.utils.unwrapObservable(placeid), website); 
                }
            } 
        } 
    }, 
    
    /* The getClickedPlaceDetails() function sends a Place Details request to Google
       when a marker is clicked. The returned results (phone number, place-id, website) are
       used as arguments when the openInfoWindow() function is called. */

    getClickedPlaceDetails : function (placeid) {
        var phoneNumber ='';
        var website = '';

        var request = {
            placeId : placeid
        }
        service.getDetails(request, callback);
        function callback(place, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                phoneNumber = place.formatted_phone_number;
                website = place.website;
                var name = place.name;
                placeid = place.place_id;
                openInfoWindow(phoneNumber, placeid, website);
            }
        }
    }
}


/* View Model */


var viewModel = function() {
    var self = this;

    // The locations array holds data collected from a Google Places search
    // (see the createMarker() function above). 

    this.locations = ko.observableArray([]);

    // The query string is created when a user submits input from the search box.

    this.query = ko.observable('');
    
    // Create an object for each location found by Google Places search. 

    this.Location = function (name, lat, long, cat, address, imgUrl,placeid) {
        this.name = ko.observable(name);
        this.lat = lat;
        this.long = long;
        this.cat = ko.observable(cat);
        this.imgUrl = ko.observable(imgUrl);
        this.placeid = ko.observable(placeid);

        // Call the addMarkers() function to add a marker to the map.
        view.addMarkers(name, lat, long, cat, address, imgUrl,placeid);
    };

    /*Remove the markers from the map and clear the results area. The emptyLocations()
      function is triggered when a new category tab in the menu is clicked, or when the
      map is reset by the user. */

    this.emptyLocations = function() {
         self.recenterMap();
         for (var i=0; i< markers.length; i++){
           markers[i].setMap(null);
         }
         markers.length = 0;  
         self.locations.removeAll();
    };
    
    /* The getPlaces() function is called when a user clicks on a custom category tab 
       (such as "beaches") in the navigation menu. It collects place details from
       the model and pushes a new Location object into the locations array, which
       results in a new marker being added to the map. */

    this.getPlaces = function(category){
        for (var place in model) {
            for(i=0; i < model[place].cat.length; i++) {
                if (model[place].cat[i] ===category) {
                    locations.push(new Location(model[place].name, model[place].lat, model[place].long, model[place].cat, model[place].address, model[place].imgUrl, model[place].placeid));  
                }
            }           
        }    
    };

    /* The sortPlaces() function is triggered when the user clicks on a location name
       rendered in the results area. It checks whether the place-id belongs to a custom
       location or to a Google Places location. In the latter case, a Place Details
       search request is sent to Google. Otherwise, the necessary details are retrieved
       directly from the model and sent to openInfoWindow().  */

    
    this.sortPlaces = function(placeid) {
        if (ko.utils.unwrapObservable(placeid).length > 6) {
            view.getPlaceDetails(placeid);
        }

        else {
            for (var place in model) {
                if (model[place].placeid === ko.utils.unwrapObservable(placeid)) {
                    var phoneNumber = model[place].phoneNumber;
                    var website = model[place].website;
                    openInfoWindow(phoneNumber, ko.utils.unwrapObservable(placeid), website); 
                }
            }        
        }
    };
    
    /* Recenter the map. This function is triggered when a new category tab on the menu
       is selected, or when the recenter-map button is clicked. */

    this.recenterMap = function() {
        map.setCenter(mapCenter);
        map.setOptions({ 'zoom' : 12 });       
        self.closeInfoWindow();
    };
 
    /* The searchBox() function handles user input from the search box. It scans the
       model for a location name matching the query string. Since all locations rendered
       on the map are saved in the model, the user can search for a specific location 
       even after its marker has been cleared from the map.*/
    
    this.searchBox = function(query) {
        var search = this.query().toLowerCase();
        for (place in model) {
            if (model[place].name.toLowerCase() === search) {
                self.emptyLocations();
                locations.push(new Location(model[place].name, model[place].lat, model[place].long, model[place].cat, model[place].address, model[place].imgUrl, model[place].placeid));
            }             
        }
        self.closeInfoWindow();
        this.recenterMap();

    }; 
    
    // Close the infoWindow.

    this.closeInfoWindow = function() {
        if (infoWindowIsOpen === true) {
            infowindow.close();
        }
        infoWindowIsOpen = false;
    };
  
    /* The openInfoWindow() function is the last in a series of functions triggered when
       the user clicks a marker on the map or a location name appearing in the results area.
       It takes the place details collected by preceeding functions  and turns them into 
       a content string for the infoWindow.  */

    this.openInfoWindow = function(phoneNumber, placeid, website) {
        // Search the model for a matching place-id. 
        for (place in model) {            
            // If a match is found, collect details from the model and save as variables.
            if (model[place].placeid === placeid) {
                var currentLat = model[place].lat;
                var currentLong = model[place].long;
                var currentName = model[place].name;
                var currentAddress = model[place].address;
                var currentPlaceId = model[place].placeid;

                // Check for a mobile display. If the screen is too small, leave the image out.
                if ($('#map-canvas').height() >= 350) {  
                    var currentImage = model[place].imgUrl;
                } else {
                    currentImage = '';
                }           

                // Check if a phone number was returned by Google Places.
                if (phoneNumber === undefined) {
                    var currentPhone = '';
                }
                else {
                    currentPhone = phoneNumber;
                }
                // Check if a website address was returned by Google Places
                if (website === undefined) {
                    var currentWebsite = '';
                }
                else {
                    currentWebsite = website;
                }
            }
        }
  
        // Construct the content string according to what details are available.

        if (currentImage === '') {
            if (currentWebsite === '') {
                var content = '<p class="bold">' + currentName +'</p><p>' + currentAddress + '<br/>' + currentPhone + '</p>'
            }
            else {
                content ='<p class="bold">' + currentName +'</p><p>' + currentAddress + '<br/>' + currentPhone + '<br/><a href="'+ currentWebsite + '">Website</a></p>';
            }
        }
        else if (currentWebsite === '') {
            content = '<p class="bold">' + currentName + '</p><img src="' + currentImage + '""><p>' + currentAddress +'<br/>'+ currentPhone +'</p>';
        }
        else {    
            content = '<p class="bold">' + currentName + '</p><img src="' + currentImage + '""><p>' + currentAddress +'<br/>'+ currentPhone +'<br/><a href="' + currentWebsite + '">Website</a></p>';
        }
        
        // Set the infoWindow's position, add content, and open it.

        infowindow.setPosition({lat: currentLat, lng: currentLong});
        infowindow.setOptions({pixelOffset : new google.maps.Size(0,-35)});
        infowindow.setContent(content);
        infowindow.open(map);
        infoWindowIsOpen = true;

        // Zoom to the corresponding place on the map.
        map.setOptions({
            'zoom' : 15,
            'center' : {lat: currentLat, lng: currentLong}
        });

        // Scroll to the top of the screen to see the map.
        $('html, body').animate({ scrollTop: 0 }, 'fast');
    };

};

view.init();
ko.applyBindings(viewModel());

// Adjust menu styling automatically when screen sizes changes.
$( window ).resize(function() {
  view.init();
});
