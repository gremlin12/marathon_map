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


// Set up Google Map 

var map = new google.maps.Map(document.getElementById('map-canvas'), {
        zoom: 13,
        center: {lat: 24.723009, lng: -81.038884}
    }); 

// Define these variables globally for use in several functions.

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
        var categories = ['lodging', 'culture', 'recreation', 'government', 'services'];
        var icons = ['&#9789;', '&#9774;', '&#9786;', '&#10026;', '&#36;'];
        var labels = ['Eating & Sleeping', 'Culture', 'Recreation', 'Government', 'Services']
        for (i=0; i < categories.length; i++) {
            if ($('#map-canvas').width() > 525)  {  
                $( '#' + categories[i] ).replaceWith( '<a href="#" id=' + categories[i] +'>' + labels[i] + '</a>' );
                $('#' + categories[i] ).css('text-align', 'left');
            } else {
                $( '#' + categories[i] ).replaceWith( '<a href="#" id=' + categories[i] + '>' + icons[i] + '</a>' );  
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
           Later, this data will be used by the addMarkers() function to place markers on the map.
           Details of each place are saved as variables. */

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

            /* Details of each place are saved as a new Location object (see viewModel) and placed in the locations array. The locations array holds basically the same information as the markers array,
            but it is ko.observable and needed to make the model-view-viewModel system work. */

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

    // Add a marker to the map for each place, using data prepared by 
    // the createMarker() function above. 
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

    sortClickedMarkers : function (placeid) {
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
    this.locations = ko.observableArray([]);
    this.query = ko.observable('');
    
    
    this.Location = function (name, lat, long, cat, address, imgUrl,placeid) {
        this.name = ko.observable(name);
        this.lat = lat;
        this.long = long;
        this.cat = ko.observable(cat);
        this.imgUrl = ko.observable(imgUrl);
        this.placeid = ko.observable(placeid);

        view.addMarkers(name, lat, long, cat, address, imgUrl,placeid);
    };

    this.emptyLocations = function() {
         self.recenterMap();
         for (var i=0; i< markers.length; i++){
           markers[i].setMap(null);
         }
         markers.length = 0;  
         self.locations.removeAll();
    };
    
    this.getPlaces = function(category){
        for (var place in model) {
            for(i=0; i < model[place].cat.length; i++) {
                if (model[place].cat[i] ===category) {
                    locations.push(new Location(model[place].name, model[place].lat, model[place].long, model[place].cat, model[place].address, model[place].imgUrl, model[place].placeid));  
                }
            }           
        }    
    };

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

    this.recenterMap = function() {
        map.setOptions(
            {
                'center': {lat: 24.723009, lng: -81.038884},
                'zoom' : 12
            });       
        self.closeInfoWindow();
    };


    this.searchPlaces = function(query) {
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


    this.closeInfoWindow = function() {
        if (infoWindowIsOpen === true) {
            infowindow.close();
        }
        infoWindowIsOpen = false;
    };

    this.openInfoWindow = function(phoneNumber, placeid, website) {

        for (place in model) {
            if (model[place].placeid === placeid) {
                var currentLat = model[place].lat;
                var currentLong = model[place].long;
                var currentName = model[place].name;
                var currentAddress = model[place].address;

                //if (window.matchMedia("(min-width: 400px)").matches) {
                if ($('#map-canvas').height() >= 350) {  
                    var currentImage = model[place].imgUrl;
                } else {
                    currentImage = '';
                }
                
                var currentPlaceId = model[place].placeid;
                if (phoneNumber === undefined) {
                    var currentPhone = '';
                }
                else {
                    currentPhone = phoneNumber;
                }
                if (website === undefined) {
                    var currentWebsite = '';
                }
                else {
                    currentWebsite = website;
                }
            }
        }
  
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
        
        infowindow.setPosition({lat: currentLat, lng: currentLong});
        infowindow.setOptions({pixelOffset : new google.maps.Size(0,-35)});
        infowindow.setContent(content);
        infowindow.open(map);
        infoWindowIsOpen = true;
        map.setOptions({
            'zoom' : 15,
            'center' : {lat: currentLat, lng: currentLong}
        });
        $('html, body').animate({ scrollTop: 0 }, 'fast');
    };

};

view.init();
ko.applyBindings(viewModel());

