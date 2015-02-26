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


var map = new google.maps.Map(document.getElementById('map-canvas'), {
    zoom: 13,
    center: {lat: 24.723009, lng: -81.038884}
});

var markers = [];
var marker;
var request;
var service = new google.maps.places.PlacesService(map);
var infowindow = new google.maps.InfoWindow();
var infoWindowIsOpen = false;
var moreButton = document.getElementById('more');
moreButton.disabled = true;


function initialize(category) {

    var request = {
        location: map.center,
        radius: '25000',
        types: [category]
    };
    service.nearbySearch(request, callback);

    function callback(results, status, pagination) {  
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
                var place = results[i];
                createMarker(results[i]);
            }
            if (pagination.hasNextPage) {
                moreButton.disabled = false;

                google.maps.event.addDomListenerOnce(moreButton, 'click', function() {
                    moreButton.disabled = true;
                    pagination.nextPage();
                });
            }
        }
    }

    function createMarker(place) {
        var name = place.name;
        var lat = place.geometry.location.lat();
        var long = place.geometry.location.lng();
        var address = place.vicinity;
        var cat = request.types;
        var imgUrl = '';
        var placeid = place.place_id;

        if (place.hasOwnProperty('photos') ) {
            imgUrl = place.photos[0].getUrl({'maxWidth':100, 'maxHeight':100});
        }

        points.push(new Point(name,lat,long,cat,address,imgUrl,placeid));


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
}

function getPlaceDetails(placeid) {
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
}    

function addMarkers(name,lat,long,cat,address,imgUrl,placeid) {
    marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat, long),
        name: name,
        map : map,
        cat : cat,
        address : address,
        imgUrl : imgUrl,
        placeid : placeid
    });

    google.maps.event.addListener(marker, 'click', (function(marker) {
        return function() {
          sortClickedMarkers(placeid);
        };
    })(marker)); 
    
    markers.push(marker);
}

function sortClickedMarkers(placeid) {
    if (ko.utils.unwrapObservable(placeid).length > 6) {
        getClickedPlaceDetails(placeid);
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
}

function getClickedPlaceDetails(placeid) {
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

var viewModel = function() {
    var self = this;
    this.points = ko.observableArray([]);
    this.query = ko.observable('');

    this.Point = function (name, lat, long, cat, address, imgUrl,placeid) {
        this.name = ko.observable(name);
        this.lat = lat;
        this.long = long;
        this.cat = ko.observable(cat);
        this.imgUrl = ko.observable(imgUrl);
        this.placeid = ko.observable(placeid);

        addMarkers(name, lat, long, cat, address, imgUrl,placeid);
    }

    this.emptyPoints = function() {
         self.recenterMap();
         for (var i=0; i< markers.length; i++){
           markers[i].setMap(null);
         }
         markers.length = 0;  
         self.points.removeAll();
    };
    
    this.getPlaces = function(category){
        for (var place in model) {
            for(i=0; i < model[place].cat.length; i++) {
                if (model[place].cat[i] ===category) {
                    points.push(new Point(model[place].name, model[place].lat, model[place].long, model[place].cat, model[place].address, model[place].imgUrl, model[place].placeid));  
                }
            }           
        }    
    };

    this.sortPlaces = function(placeid) {
        if (ko.utils.unwrapObservable(placeid).length > 6) {
            getPlaceDetails(placeid);
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
                'zoom' : 13
            }
        );
        self.closeInfoWindow();
    };


    this.searchPlaces = function(query) {
        var search = this.query().toLowerCase();
        for (place in model) {
            if (model[place].name.toLowerCase() === search) {
                self.emptyPoints();
                points.push(new Point(model[place].name, model[place].lat, model[place].long, model[place].cat, model[place].address, model[place].imgUrl, model[place].placeid));
            }             
        }
        self.closeInfoWindow();
        this.recenterMap();

    }; 



    // The following fix is from Steve Michelotti's blog

   /* this.searchOnEnter = function() {
        var keyCode = (event.which ? event.which : event.keyCode);
            if (event.keyCode === 13) {
                this.searchPlaces();
                return false;
            }
            return true;
    }; */

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

                if (window.matchMedia("(min-width: 400px)").matches) {
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


ko.applyBindings(viewModel());