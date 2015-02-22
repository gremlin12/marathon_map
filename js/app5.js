var model = [    
     {
        name : 'Marathon Library',
        lat : 24.710633,
        long : -81.095606,
        cat : ['places'],
        imgUrl : '',
        address : '',
        placeid : 'library'
     },
     {
        name : 'Marathon Community Park',
        lat : 24.711631,
        long : -81.089487,
        cat : ['places','parks'],
        imgUrl : '',
        address : '',
        placeid : 'comm_park'
     },
     {
        name : 'Sombrero Beach',
        lat : 24.691533,
        long : -81.086107,
        cat : ['beaches','parks'],
        imgUrl : '',
        address : '',
        placeid : 'sombrero_b'
     },
     {
        name : 'Coco Plum Beach',
        lat : 24.730240,
        long : -81.001592,
        cat : ['beaches', 'parks'],
        imgUrl : '',
        address : '',
        placeid : 'coco_plum'
     },
     {
     	name : 'Dolphin Research Center',
     	lat: 24.766999,
     	long : -80.945549,
     	cat : ['places'],
        imgUrl : '',
        address : '',
        placeid : 'dolphin_re'
     },
     {
        name : 'Duck Key',
        lat : 24.775669,
        long : -80.912247,
        cat : ['places'],
        imgUrl : '',
        address : '',
        placeid : 'duck_key'
     },
     {
        name : 'Pigeon Key',
        lat : 24.703991,
        long : -81.155308,
        cat : ['places'],
        imgUrl : '',
        address : '',
        placeid : 'pigeon_key'       
     }  
];


function Point(name, lat, long, cat, address, imgUrl,placeid) {
    this.name = ko.observable(name);
    this.lat = ko.observable(lat);
    this.long = ko.observable(long);
    this.cat = ko.observable(cat);
    this.imgUrl = ko.observable(imgUrl);
    this.placeid = ko.observable(placeid);


    addMarkers(name, lat, long, cat, address, imgUrl,placeid);
}


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


function initialize(category) {

    var request = {
        location: map.center,
        radius: '25000',
        types: [category]
    };
    service.nearbySearch(request, callback);

    function callback(results, status) {  
        console.log(status); 
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
                var place = results[i];
                createMarker(results[i]);
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
    console.log(placeid());
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
          getClickedPlaceDetails(placeid);
        };
    })(marker)); 
    
    markers.push(marker);
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
    points = ko.observableArray([]);
    this.query = ko.observable('');


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

    this.recenterMap = function() {
        map.setOptions(
            {
                'center': {lat: 24.723009, lng: -81.038884},
                'zoom' : 13
            }
        );
    };


    this.searchPlaces = function(query) {
        var search = this.query().toLowerCase();
        for(var place in model) {
            if (model[place].name.toLowerCase() === search) {
                self.emptyPoints();
                points.push(new Point(model[place].name, model[place].lat, model[place].long, model[place].cat, model[place].address, model[place].imgUrl, model[place].placeid));
            }
        }
        self.closeInfoWindow();
        this.recenterMap();

    };

    // The following fix is from Steve Michelotti's blog

    this.searchOnEnter = function() {
        var keyCode = (event.which ? event.which : event.keyCode);
            if (keyCode === 13) {
                this.searchPlaces();
                return false;
            }
            return true;
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
                var currentImage = model[place].imgUrl;
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
                var content = '<h3>' + currentName +'</h3><p>' + currentAddress + '<br/>' + currentPhone + '</p>'
            }
            else {
                content ='<h3>' + currentName +'</h3><p>' + currentAddress + '<br/>' + currentPhone + '<br/><a href="'+ currentWebsite + '">Website</a></p>';
            }
        }
        else if (currentWebsite === '') {
            content = '<h3>' + currentName + '</h3><img src="' + currentImage + '""><p>' + currentAddress +'<br/>'+ currentPhone +'</p>';
        }
        else {    
            content = '<h3>' + currentName + '</h3><img src="' + currentImage + '""><p>' + currentAddress +'<br/>'+ currentPhone +'<br/><a href="' + currentWebsite + '">Website</a></p>';
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
    };

/*    this.removeWiki = function() {
    	$('#wiki-elem').remove();
    }; */


/*    this.getWikiFromMarker = function(name) {
        for (var place in model) {
            if (model[place].name === name) {
                if (model[place].wiki === false) {
                    infowindow.setContent(name);
                }    
                else {
                    var imageStr = '';
                    var contentString = '';
                    var linkString = '';
                    var searchTerm = name;
                    var wikiString = 'http://en.wikipedia.org/w/api.php?action=query&prop=extracts|images|info&rvprop=content&format=json&inprop=url&exsentences=5&exlimit=3&exsentences=20&titles=' + encodeURIComponent(searchTerm);
                    $.ajax({
                        url: wikiString,
                        dataType: 'jsonp',
                        success: function(response) {    
                            for (var key in response.query.pages) {
                  
                                contentString = '<p>'+response.query.pages[key]['title']+'</p>' + response.query.pages[key].extract;
                                linkString =  '<p>Learn more about <a href="' +  response.query.pages[key].fullurl+'">'+name+'</a></p>';
                                infowindow.setContent(contentString + linkString);   
                            }
                        }
                    })
                }
            }
        }           
    };

    this.getWiki = function(name) {
        for (var place in model) {
            if (model[place].name === name()) {
                if (model[place].wiki === false) {
                    infowindow.setContent(name());
                }
                else {    
                    var contentString = '';
                    var linkString = '';
                    var searchTerm = name();
                    var wikiString = 'http://en.wikipedia.org/w/api.php?action=query&prop=extracts|images|info&rvprop=content&format=json&inprop=url&exsentences=5&exlimit=3&exsentences=20&titles=' + encodeURIComponent(searchTerm);

                    $.ajax({
                        url: wikiString,
                        dataType: 'jsonp',
                        success: function(response) {            
                            for (var key in response.query.pages) {
                                contentString = '<p>'+response.query.pages[key]['title']+'</p>' + response.query.pages[key].extract; 
                                linkString =  '<p>Learn more about <a href="' +  response.query.pages[key].fullurl+'">'+name()+'</a></p>';
                            }                                                       
                            var currentLat = model[place].lat;
                            var currentLong = model[place].long;
                            var currentName = model[place].name;                            
                            infowindow.setPosition({lat: currentLat, lng: currentLong});
                            infowindow.setContent(contentString +linkString);
                            infowindow.open(map);
                            infoWindowIsOpen = true;  
                        }
                    })
                }
            }
        }
    }; */           
};


ko.applyBindings(viewModel());



