var model = {

  places : [    
     {
        name : 'Marathon Library',
        lat: 24.710633,
        long: -81.095606

     },
     {
        name : 'Marathon Community Park',
        lat : 24.711631,
        long: -81.089487
     }
],

  beaches  : [
     {
        name : 'Sombrero Beach',
        lat: 24.691533,
        long: -81.086107
     },
     {
        name : 'Coco Plum Beach',
        lat : 24.730240,
        long : -81.001592
     }   

]
};

function Point(name, lat, long) {
    this.name = ko.observable(name);
    this.lat = ko.observable(lat);
    this.long = ko.observable(long);

    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat, long),
        map: map
    }); 

    google.maps.event.addListener(marker, 'click', (function(marker) {
        return function() {
          infowindow.setContent(name);
          infowindow.open(map, marker);
        };
    })(marker));
}


var map = new google.maps.Map(document.getElementById('map-canvas'), {
    zoom: 13,
    center: {lat: 24.726389, lng: -81.040278}
});

var infowindow = new google.maps.InfoWindow();

var currentList = model.places;

var viewModel = function() {
    var self = this;

    points = ko.observableArray([]);
    for (var place in currentList) {
        points.push(new Point(currentList[place].name, currentList[place].lat, currentList[place].long));
    }  
};

ko.applyBindings(viewModel());