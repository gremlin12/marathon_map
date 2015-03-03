# marathon_map

Marathon Map is an interactive web application that showcases local attractions
and amenities in Marathon, Florida -- the heart of the Florida Keys! By selecting
a category from the menu -- which includes restaurants, hotels, and a number of recreational
opportunities -- users may see up to twenty relevant locations immediately displayed on the map. 
Clicking on a map marker or a location name reveals additional information about each individual
attraction. 

The project relies on the Google Maps API and Places Library for its basic functionality and 
content. The Knockout.js and jQuery libraries provide additional structure and streamlining.

While the current project focuses on Marathon, the application can be customized for any
city or neighborhood simply by changing the map-center coordinates in the main javascript file. 
Additionally, custom locations can be added independently of Google's API, allowing 
developers to make use of local knowledge.

To see a live demo of the map, visit http://gremlin12.github.io/marathon_map/

** How to Use **
   1. Download the marathon-map zip-file.
   2. Extract the files.
   3. Make sure you have an internet connection -- the map won't work without it!
   4. Open the index.html file in your browser. You should see the map appear.
   5. Hover over the navigation menu tabs to see the categories drop down.
   6. Select a category by clicking it. You should see markers appear on the map and
   location names to the side of the map (or below the map if you are using
   a mobile device).
   7. Click on a marker or a location name and you should see an information window
   pop up with basic details about the place.
   8. Once a location has been rezzed on the map, its details are saved. To retrieve the
   location, you can type its name in the search bar and click the search button. (You
   must type the entire name.)

** Caveats **
   
   The application relies on the Google Maps API and Google Places Library for its content.
Google's algorithms are not infallible and can occasionally return information that is 
incomplete, misleading, or wrong. For example, a city park may appear to be at city 
hall instead of at its actual physical location. Or you may see duplicate markers
for the same school or business.  Please be mindful of the technology's limitations
when using Marathon Map.


