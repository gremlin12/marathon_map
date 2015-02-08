 var locations = [

];

/* Map  */

var mapOptions = {
    zoom: 13,
    center: {lat: 24.726389, lng: -81.040278},
};

var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

var infowindow = new google.maps.InfoWindow();


var marker, i;

for (i = 0; i < locations.length; i++) {
	marker = new google.maps.Marker({
		position: new google.maps.LatLng(locations[i][1], locations[i][2]),
		map: map
	});

    google.maps.event.addListener(marker, 'click', (function(marker, i) {
        return function() {
          infowindow.setContent(locations[i][3]);
          infowindow.open(map, marker);
        }
    })(marker, i));    
}
var center;
function calculateCenter() {
	center = map.getCenter();
}

google.maps.event.addDomListener(map, 'idle', function() {
	calculateCenter();
});
google.maps.event.addDomListener(window, 'resize', function() {
	map.setCenter(center);
});

