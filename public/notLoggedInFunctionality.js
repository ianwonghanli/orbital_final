let map, currentLocation, currentMarker, currentInfoWindow, currentClosableTab;
let searchRadius = 50000;
let markers = [];

/**
 * Initialises the map.
 *
 * Links Google Maps search box to the search input element.
 * The website will ask for user's current location and adjust the map accordingly such that the map
 * is focussed on the user's current location
 */
function initMap() {
    const singapore = { lat: 1.3521, lng: 103.8198 };
    // Initialises the map
    map = new google.maps.Map(document.getElementById("map"), {
        center: singapore,
        zoom: 11.5,
        mapTypeControl: false,
    });

    // //Add title to welcome user
    // const title = document.getElementById("title");
    // //Add username from database here
    // title.innerHTML = `Welcome ${username}`;

    // //Implement sign out button functionality
    // const signOutButton = document.getElementById("sign-out-button");
    // //Implement sign out functionality
    // signOutButton.addEventListener("click", () => {})

    // Create the search box and link it to the input element
    const searchInput = document.getElementById("pac-input");
    const searchBox = new google.maps.places.SearchBox(searchInput);

    const searchButton = document.getElementById("search-button"); 
    // Adds an event listener such that hitting the search button performs a search
    searchButton.addEventListener("click", () => {
        showSearchResults(searchInput.value, "search", null, null);
    })

    // Adds an event listener such that hitting enter performs a search
    searchInput.addEventListener("keydown", event => {
        // Check if the Enter key was pressed (key code 13)
        if (event.key === "Enter") {
          event.preventDefault(); // Prevent form submission
          showSearchResults(searchInput.value, "search", null, null);
        }
    });

    // Add event listener to close the dropdown for the search box
    const closeButton = document.getElementById("dropdown-button");
    const closeButtonText = document.getElementById("dropdown-text")
    const filterContainer = document.getElementById("filter-container");
    closeButton.addEventListener("click", () => {
        if (filterContainer.style.display === "none") {
            filterContainer.style.display = "inline-block";
            closeButton.innerHTML = "▲";
            closeButtonText.innerHTML = "Close filters";
            closeButton.style.margin = "0"
        } else {
            filterContainer.style.display = "none";
            closeButton.innerHTML = "▼";
            closeButtonText.innerHTML = "Click for filters";
            closeButton.style.marginTop = "5px"
            closeButtonText.style.display = "inline-block";
        }
    });

    // Retrives the user's current location and sets the bounds of autocomplete suggestions
    setCurrentLocation();

    /**
     * Sets the map viewport centered around the user's current location.
     *
     * Autocomplete suggestions are also restricted according to the radius argument.
     */
    function setCurrentLocation() {
        // Try to retrieve the user's current location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const { latitude, longitude } = position.coords;
    
                // Create a LatLng object with the user's coordinates
                currentLocation = new google.maps.LatLng(latitude, longitude);

                // Calculate the southwest and northeast corners of the square
                const sw = google.maps.geometry.spherical.computeOffset(currentLocation, searchRadius, 225);
                const ne = google.maps.geometry.spherical.computeOffset(currentLocation, searchRadius, 45);

                // Create a LatLngBounds object with the southwest and northeast corners
                const bound = new google.maps.LatLngBounds(sw, ne);
                //Set the bounds of autocomplete suggestions to the bound
                searchBox.setBounds(bound);
    
                // Place a marker at the user's location on the map
                new google.maps.Marker({
                    position: currentLocation,
                    map,
                    title: "Your Location",
                });
    
                // Center the map on the user's location
                map.setCenter(currentLocation);
            }, error => {
                    console.error("Error retrieving location:", error);
                });
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    }
}

/**
 * Displays markers at locations which match the user's search.
 *
 * Removes all current markers. Then searches for all places that match the user's input, filters and search bounds.
 * Clickable markers are shown at each place which show details about the place when clicked.
 * 
 * @param {} query - The value inputted by the user in the search box
 * @param {} purpose - The reason for triggering the search
 */
async function showSearchResults(query, purpose, places, viewbound) {
    // Do not remove the markers if purpose is "recommendations"
    if (purpose === "search") {
        removeMarkers(map);
    }

    //Getting information about users' filters
    let filters = document.querySelectorAll(".type");
    filters.forEach(filter => {
        if (filter.checked) {
            query+= ` ${filter.name}`
        }
    })
    
    let priceRanges = [];
    let prices = document.querySelectorAll(".price-range")
    prices.forEach(price => {
        if (price.checked) {
            let priceLevel = price.id.length - 1;
            priceRanges.push(priceLevel);
        }
    })

    let distanceAway = document.querySelectorAll(".distance-away")
    distanceAway.forEach(distance => {
        if (distance.checked) {
            searchRadius = distance.id;
        }
    })

    // Create a PlacesService object
    const service = new google.maps.places.PlacesService(document.createElement('div'));
  
    // Define the search request
    const searchRequest = {
      query,
    //   Restricts the search to only food-related places
      types: ["restaurant", "cafe", "bakery", "bar", "meal_delivery", "meal_takeaway", "grocery_or_supermarket", "convenience_store", "liquor_store"]
    };
  
    try {
      // Perform the search
      const results = await new Promise((resolve, reject) => {
        service.textSearch(searchRequest, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            resolve(results);
          } else {
            reject(new Error(`PlacesServiceStatus: ${status}`));
          }
        });

      });
  
      let counter = 1;
      // Initialising the bounds which represents the users' viewport after the search
      const viewbounds = new google.maps.LatLngBounds();
      // Set the bounds to include the user's current location
      viewbounds.extend(currentLocation);

      let searchResultsInfo = await Promise.all(
        results.filter(result => {  
        // Filter results by user's price range and distance
        const distance = google.maps.geometry.spherical.computeDistanceBetween(currentLocation, result.geometry.location);
        if (priceRanges.length > 0) {
            for (let price of priceRanges) {
                if (result.price_level === price) {
                    return distance <= searchRadius; 
                }
            }
            return false;
        } else {
            return distance <= searchRadius;
        }
      }).map(async result => {
        console.log(result);
        const reviews = await new Promise((resolve, reject) => {
            // Create a new request for place reviews as textSearch() is unable to access place reviews
            const request = {
                placeId: result.place_id,
                fields: ["reviews"]
            };

            service.getDetails(request, (place, status) => {
              if (status === google.maps.places.PlacesServiceStatus.OK) {
                resolve(place.reviews);
              } else {
                reject(new Error(`PlacesServiceStatus: ${status}`));
              }
            })
        });
        
        const zIndex = counter++;
        // Sets the bounds to include the search result
        if (viewbound) {
            places.push(result);
            viewbound.extend(result.geometry.location);
        } else {
            viewbounds.extend(result.geometry.location);
        }
        return {...result, reviews, zIndex};
      }));

      // If there are any open tabs, close them
      if (currentClosableTab) {
        currentClosableTab.remove()
      }

      if (viewbound) {
        return {places, viewbound};
      }

      if (searchResultsInfo.length === 0) {
        let content = document.createElement("p");
        content.innerHTML =`
            <h3>No places found<h3>
        `;
        let searchBox = document.getElementById("pac-card");
        currentClosableTab = createClosableTab(searchBox, content);
      } else {
        // Call the setMarkers function to display the markers on the map
        searchResultsInfo = await setMarkers(map, searchResultsInfo, "place");
        // Create a window listing the search results
        makeArrayWindow(searchResultsInfo, "place", null);
        // Finalises the bounds based on all the search results
        map.fitBounds(viewbounds);
        return searchResultsInfo;
      }
    } catch (error) {
      console.error('Error occurred during search:', error);
    }
}

/**
 * Creates a window which displays information from the elements in the array
 * 
 * @param {*} array - The array containing elements whose information we wish to display
 * @param {*} purpose - Specifies how the information should be displayed
 */
function makeArrayWindow(array, purpose, placeId) {
    // If there there is currently an open tab, close it first
   if (currentClosableTab) {
       currentClosableTab.remove()
   }

   // Create an information window showing all places in th array, below the search container
   let container = document.createElement("ul")
   container.style.maxHeight = "300px";
   container.style.overflow = "auto";
   container.innerHTML = "";

   if (purpose === "place") {
       for (let place of array) {
           let placeItem = document.createElement("li");
            placeItem.innerHTML = `
                <h3>${place.name}</h3>
                <hr>
            `;
           placeItem.style.cursor = "pointer";

           //Add an event listener which opens the information window of the place upon clicking
           placeItem.addEventListener("click", event => {
            event.stopPropagation();
            google.maps.event.trigger(place.marker, "click");
           });
           container.appendChild(placeItem);
       }
   }
   let searchContainer = document.getElementById("pac-card");
   currentClosableTab = createClosableTab(searchContainer, container);;
}

//IMAGES STILL NOT WORKING!!
/**
 * Places a marker at all places in the array.
 *
 * Each place in the array is given a marker with a listener which displays information about the place
 * when clicked.
 * 
 * @param {} map - The map being used.
 * @param {} array - The array containing places. Each element contains information about the place as shown in the DOM
 *                   and its z-index, to deal with overlapping info windows.
 * @param {} purpose - Specifies the type of markers to be created
 */
async function setMarkers(map, array, purpose) {
    // Shapes define the clickable region of the icon. The type defines an HTML
    // <area> element 'poly' which traces out a polygon as a series of X,Y points.
    // The final coordinate closes the poly by connecting to the first coordinate.
    const shape = {
      coords: [1, 1, 1, 20, 18, 20, 18, 1],
      type: "poly",
    };

    // Create a marker for each place
    for (let i = 0; i < array.length; i++) {
        const result = await array[i]
        const marker = new google.maps.Marker({
            position: result.geometry.location,
            map,
            shape: shape,
            title: result.name,
            zIndex: result.zIndex,
        });

        let icon = "";
        // Changing the marker icon depending on the purpose
        if (purpose === "place" || purpose === "foodTrend" || purpose === "recommendations") {
            icon = "https://maps.google.com/mapfiles/kml/shapes//dining.png"
        } else if (purpose === "eventTrend") {
           icon = "http://maps.google.com/mapfiles/kml/paddle/grn-stars.png"
        }
        console.log("Image is: ")
        console.log(icon)
        // iconBase += image.url
        marker.setIcon(icon);
        
        // Adds the marker to the array of currently displayed markers
        markers.push(marker);

        // Add a click listener to each marker which will show its details upon click
        marker.addListener("click", async () => {
            // Close the currently open info window and change its marker icon back to normal, if any
            if (currentInfoWindow) {
                currentInfoWindow.close();
                currentMarker.setIcon(icon);
                console.log(`Old marker icon url is set back to: ${currentMarker.icon.url}`)
            }

            const chosenIcon = "http://maps.google.com/mapfiles/kml/paddle/red-circle.png"

            console.log("Chosen Image is: ")
            console.log(chosenIcon)

            let infoWindow;
            // Create an info window depending on the purpose at the clicked marker's position 
            // and change the marker icon
            if (purpose === "place" || purpose === "foodTrend" || purpose === "recommendations") {
                infoWindow = makePlaceInfoWindow(result);
                //HERE!!
            } else if (purpose === "eventTrend") {
                infoWindow = makeEventTrendInfoWindow(result);
            } 
            marker.setIcon(chosenIcon);
            infoWindow.open(map, marker);
            console.log(`New marker icon url is set to: ${marker.icon.url}`)

            // Update the currentInfoWindow and currentMarker variable
            currentInfoWindow = infoWindow;
            currentMarker = marker;
        });
        array[i] = {...array[i], marker};
    }
    return array;
}

/**
 * Removes all current markers on the map
 *
 * @param {} map - The map being used.
 */
function removeMarkers(map) {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}

/**
 * Creates an info window containing details about "result"
 *
 * 
 * @param {} result - The place which we require details about
 * @returns The info window containing all the information regarding the place
 */
function makePlaceInfoWindow(result) {
    console.log("I AM MAKE PLACE WINDOW")
    // If the place has a phone number, retrieve it
    let phoneNumber = "";
    if (result.formatted_phone_number) {
        phoneNumber = `Phone Number: ${result.formatted_phone_number}`
    }

    // If the place has a website, retrieve it
    let website = "";
    if (result.website !== undefined) {
        website = `Website: ${result.website}`
    }

    // If the place has a price level, retrieve it
    let priceLevel = ""
    if (result.price_level !== undefined) {
        priceLevel = `Price Level: ${result.price_level}`
    }

    // If the place has reviews, retrieve them
    let reviewsContent = "";

    if (result.reviews && result.reviews.length > 0) {
        result.reviews.forEach(review => {
            reviewsContent += `
                <p>Review: ${review.text}</p>
                <p>Rating: ${review.rating}/5</p>
                <p>Author: ${review.author_name}</p>
                <hr>
            `;
        });
    }

    // If the place has photos, retrieve them
    let photoContent = "";
    if (result.photos && result.photos.length > 0) {
        photoContent = document.createElement("div")
        result.photos.forEach(photo => {
            const img = document.createElement("img");
            img.src = photo.getUrl({ maxWidth: 400, maxHeight: 400 });
            photoContent.appendChild(img);
        });
        photoContent = photoContent.innerHTML;
    }

    console.log("Got all info")
    // console.log(addToListButton.outerHTML)

    //The content to be displayed in the info window
    const infoWindowContent = `
        <h3>${result.name}</h3>
        <button id="share-button">Share</button>
        <button id="add-to-list-button">+ Add To List</button>
        <p>Address: ${result.formatted_address}</p>
        ${phoneNumber}
        <p>Distance: ${(google.maps.geometry.spherical.computeDistanceBetween(currentLocation, result.geometry.location) / 1000).toFixed(1)}km away</p>
        ${website}
        ${priceLevel}
        <p>Rating: ${result.rating} stars</p>
        <p>Number of ratings: ${result.user_ratings_total}</p>
        ${reviewsContent}
        ${photoContent}
    `

    const infoWindow = new google.maps.InfoWindow({
        content: infoWindowContent
    });

    google.maps.event.addListenerOnce(infoWindow, "domready", () => {
        const shareButton = document.getElementById("share-button");
        shareButton.addEventListener("click", () => {
            console.log("SHARE BUTTON WORKING")
                // Check if the Web Share API is supported by the browser
            if (navigator.share) {
                navigator.share({
                title: "Place Title",
                text: "Check out this amazing place!",
                url: "https://example.com/place"
                })
                .then(() => console.log("Place shared successfully."))
                .catch((error) => console.log("Error sharing place:", error));
            } else {
                console.log("Web Share API is not supported in this browser.");
                // Provide an alternative sharing method or display an error message
            }
        });
    });

     // Append the addToListButton to the info window before opening it
    //  const div = document.createElement('div');
    //  div.appendChild(addToListButton);
    //  infoWindow.setContent(div.innerHTML + infoWindowContent);

    return infoWindow;
}

/**
 * Creates a tab which can be closed by clicking the "X" button
 * 
 * @param {*} elementToAppendTo - The element which the tab should be appended to
 * @param {*} content - The contents of the tab
 * @returns The closable tab
 */
function createClosableTab(elementToAppendTo, content) {
    let container = document.createElement("div");
    let buttonContainer = document.createElement("div");
    let closeButton = document.createElement("button");
    closeButton.innerText = "X";
    buttonContainer.append(closeButton);
    buttonContainer.style.display = "flex";
    buttonContainer.style.justifyContent = "end";

    closeButton.addEventListener("click", () => {
        container.remove();
        const tabs = document.querySelectorAll(".tabs button");
        // Remove 'active' class from all tabs
        tabs.forEach(tab => tab.classList.remove('active'));
    })
    container.append(buttonContainer, content);
    container.style.marginTop = "5px"
    elementToAppendTo.appendChild(container);
    // elementToAppendTo.insertAdjacentElement("afterend", container)
    return container;
}

window.initMap = initMap;