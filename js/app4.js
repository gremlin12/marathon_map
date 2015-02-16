var model = [    
     {
        name : 'Marathon Library',
        lat : 24.710633,
        long : -81.095606,
        cat : ['places']
     },
     {
        name : 'Marathon Community Park',
        lat : 24.711631,
        long : -81.089487,
        cat : ['places','parks']
     },
     {
        name : 'Sombrero Beach',
        lat : 24.691533,
        long : -81.086107,
        cat : ['beaches','parks']

     },
     {
        name : 'Coco Plum Beach',
        lat : 24.730240,
        long : -81.001592,
        cat : ['beaches', 'parks']
     },
     {
     	name : 'Dolphin Research Center',
     	lat: 24.766999,
     	long : -80.945549,
     	cat : ['places']
     }   
];


function Point(name, lat, long, cat, yelpId) {
    this.name = ko.observable(name);
    this.lat = ko.observable(lat);
    this.long = ko.observable(long);
    this.cat = ko.observable(cat);
    this.yelpId = ko.observable(yelpId);


    addMarkers(name,lat,long,cat,yelpId);
}


var map = new google.maps.Map(document.getElementById('map-canvas'), {
    zoom: 13,
    center: {lat: 24.726389, lng: -81.040278}
});

var markers = [];
var marker;
var infoWindowIsOpen = false;

function addMarkers(name,lat,long,cat) {
    marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat, long),
        name: name,
        map : map,
        cat : cat
    });

        google.maps.event.addListener(marker, 'click', (function(marker) {
        return function() {
          infowindow.setContent(name);
          infowindow.open(map, marker);
          infoWindowIsOpen = true;
        };
    })(marker)); 
    
    markers.push(name);
}

var infowindow = new google.maps.InfoWindow();


var viewModel = function() {
    var self = this;
    points = ko.observableArray([]);
    this.query = ko.observable('');

    this.emptyPoints = function() {
    	 $('#wiki-elem').remove();
         for (var item in markers){
           markers[item].setMap(null);
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
    		}
    	}
  
        infowindow.setPosition({lat: currentLat, lng: currentLong});
        infowindow.setContent(currentName);
        infowindow.open(map);
        infoWindowIsOpen = true; 
    };

    this.removeWiki = function() {
    	$('#wiki-elem').remove();
    };

    this.getWiki = function(name) {
        var contentString = '';
        var linkString = '';
    	$wikiElem = $('#wikipedia-links');  	
    	var searchTerm = name();
        var wikiString = 'http://en.wikipedia.org/w/api.php?action=opensearch&search='+ encodeURIComponent(searchTerm) +'&format=json&callback=wikiCallback';
        var wikiExtractString = 'http://en.wikipedia.org/w/api.php?action=query&prop=extracts|images&format=json&exsentences=5&exlimit=1&titles=' + encodeURIComponent(searchTerm);
            $.ajax({
                url: wikiExtractString,
                dataType: 'jsonp',
                success: function(response) {
                    console.log(response);
                    contentString = '<p>'+response.query.pages['10644323']['title']+'</p>' + response.query.pages['10644323'].extract;
                }
            })

                $.ajax({
                	url: wikiString,
                	dataType: 'jsonp',
                	success: function(response) {
                        var articleList = response[1];
                            if (articleList.length === 0) {
                            	self.openInfoWindow(name);
                            } else {

                                for (var i=0; i < articleList.length; i++) {
    			                    articleStr = articleList[i];
    			                    var url = 'http://en.wikipedia.org/wiki/' + articleStr;
    			                    linkString =  '<p>Learn more about <a href="' + url + '">' + articleStr + '</a></p>'
    		                    };
                                

    		                    for (place in model) {
    		                        if (model[place].name === name()) {
    			                        var currentLat = model[place].lat;
    			                        var currentLong = model[place].long;
    			                        var currentName = model[place].name;
    		                        }
    	                        }
  
                                infowindow.setPosition({lat: currentLat, lng: currentLong});
                                infowindow.setContent(contentString + linkString);
                                infowindow.open(map);
                                infoWindowIsOpen = true; 
    		                } 

    		        }
                });
        
    }; 

};  


ko.applyBindings(viewModel());




//http://en.wikipedia.org/w/api.php?action=query&prop=images&format=json&imlimit=5&titles=Dolphin%20Research%20Center

