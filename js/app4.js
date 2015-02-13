var model = [    
     {
        name : 'Marathon Library',
        lat : 24.710633,
        long : -81.095606,
        cat : 'places'
     },
     {
        name : 'Marathon Community Park',
        lat : 24.711631,
        long : -81.089487,
        cat : 'places'
     },
     {
        name : 'Sombrero Beach',
        lat : 24.691533,
        long : -81.086107,
        cat : 'beaches'
     },
     {
        name : 'Coco Plum Beach',
        lat : 24.730240,
        long : -81.001592,
        cat : 'beaches'
     }   
];


function Point(name, lat, long, cat) {
    this.name = ko.observable(name);
    this.lat = ko.observable(lat);
    this.long = ko.observable(long);
    this.cat = ko.observable(cat);


    addMarkers(name,lat,long);
}


var map = new google.maps.Map(document.getElementById('map-canvas'), {
    zoom: 13,
    center: {lat: 24.726389, lng: -81.040278}
});

var markers = [];
var marker;

function addMarkers(name,lat,long) {
    marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat, long),
        name: name,
        map : map
    });

        google.maps.event.addListener(marker, 'click', (function(marker) {
        return function() {
          infowindow.setContent(name);
          infowindow.open(map, marker);
        };
    })(marker)); 
    
    markers.push(marker);
};

var infowindow = new google.maps.InfoWindow();




var viewModel = function() {
    var self = this;
    points = ko.observableArray([]);
    //this.beaches = ko.observableArray([]);

    this.emptyPoints = function() {
         for (item in markers){
           markers[item].setMap(null);
         }
         markers.length = 0;  
         self.points.removeAll();
    };
    
    this.getBeaches = function(){
        for (place in model) {
            if (model[place].cat === 'beaches') {
                points.push(new Point(model[place].name, model[place].lat, model[place].long));
            } 
        }
    };


    this.getPlaces = function() {
        for (place in model) {
            if (model[place].cat === 'places') {
                points.push(new Point(model[place].name, model[place].lat, model[place].long));
            }    
        }
    };


};

ko.applyBindings(viewModel());

