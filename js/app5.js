var model = [    
     {
        name : 'Marathon Library',
        lat : 24.710633,
        long : -81.095606,
        cat : ['places'],
        imgUrl : '',
        address : ''
     },
     {
        name : 'Marathon Community Park',
        lat : 24.711631,
        long : -81.089487,
        cat : ['places','parks'],
        imgUrl : '',
        address : ''
     },
     {
        name : 'Sombrero Beach',
        lat : 24.691533,
        long : -81.086107,
        cat : ['beaches','parks'],
        imgUrl : '',
        address : ''
     },
     {
        name : 'Coco Plum Beach',
        lat : 24.730240,
        long : -81.001592,
        cat : ['beaches', 'parks'],
        imgUrl : '',
        address : ''
     },
     {
     	name : 'Dolphin Research Center',
     	lat: 24.766999,
     	long : -80.945549,
     	cat : ['places'],
        imgUrl : '',
        address : ''
     },
     {
        name : 'Duck Key',
        lat : 24.775669,
        long : -80.912247,
        cat : ['places'],
        imgUrl : '',
        address : ''
     },
     {
        name : 'Pigeon Key',
        lat : 24.703991,
        long : -81.155308,
        cat : ['places'],
        imgUrl : '',
        address : ''       
     }  
];


function Point(name, lat, long, cat, address, imgUrl) {
    this.name = ko.observable(name);
    this.lat = ko.observable(lat);
    this.long = ko.observable(long);
    this.cat = ko.observable(cat);
    this.imgUrl = ko.observable(imgUrl);


    addMarkers(name, lat, long, cat, address, imgUrl);
}


var map = new google.maps.Map(document.getElementById('map-canvas'), {
    zoom: 12,
    center: {lat: 24.726389, lng: -81.040278}
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
        radius: '5000',
        types: [category]
    };
    service.nearbySearch(request, callback);

function callback(results, status) {
    
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

  if (place.hasOwnProperty('photos') ) {
      imgUrl = place.photos[0].getUrl({'maxWidth':100, 'maxHeight':100});
     //console.log(place.photos[0].getUrl({'maxWidth' : 100, 'maxHeight' : 100}));
  }

  points.push(new Point(name,lat,long,cat,address,imgUrl));


  var obj = {
    name : name,
    lat : lat,
    long : long,
    cat : cat,
    address : address,
    imgUrl : imgUrl
  }

  model.push(obj);
}
}

function addMarkers(name,lat,long,cat,address,imgUrl) {
    marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat, long),
        name: name,
        map : map,
        cat : cat,
        address : address,
        imgUrl : imgUrl
    });

    google.maps.event.addListener(marker, 'click', (function(marker) {
        return function() {
          //getWikiFromMarker(name);
          console.log(imgUrl); 
          var content = '<p>' + name + '</p><img src="' +imgUrl + '"><p>'+address+'</p>'; 
          infowindow.setContent(content);
          infowindow.setOptions({pixelOffset : new google.maps.Size(0,0)});
          infowindow.open(map, marker);
          infoWindowIsOpen = true;
          map.setOptions({
            'zoom' : 16,
            'center' : marker.position
        });
        };
    })(marker)); 

    
    markers.push(marker);
}


var viewModel = function() {
    var self = this;
    points = ko.observableArray([]);
    this.query = ko.observable('');

    this.justTesting = function() {

    };

    this.emptyPoints = function() {
    	// $('#wiki-elem').remove();
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
                    points.push(new Point(model[place].name, model[place].lat, model[place].long, model[place].cat) );
                }
            }           
        }    
    };

    this.recenterMap = function() {
        map.setOptions(
            {
                'center': {lat: 24.726389, lng: -81.040278},
                'zoom' : 12
            }
        );
    };


    this.searchPlaces = function(query) {
        var search = this.query().toLowerCase();
        for(var place in model) {
            if (model[place].name.toLowerCase() === search) {
                self.emptyPoints();
                points.push(new Point(model[place].name, model[place].lat, model[place].long));
            }
        }
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

    this.openInfoWindow = function(name) {

    	for (place in model) {
    		if (model[place].name === name()) {
    			var currentLat = model[place].lat;
    			var currentLong = model[place].long;
    			var currentName = model[place].name;
                var currentAddress = model[place].address;
                var currentImage = model[place].imgUrl;
    		}
    	}
  
        infowindow.setPosition({lat: currentLat, lng: currentLong});
        infowindow.setOptions({pixelOffset : new google.maps.Size(0,-35)});
        var content = '<p>' + currentName + '</p><img src=' + currentImage + '"><p>' + currentAddress + '</p>';
        infowindow.setContent(content);
        infowindow.open(map);
        infoWindowIsOpen = true;
        map.setOptions({
            'zoom' : 16,
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



