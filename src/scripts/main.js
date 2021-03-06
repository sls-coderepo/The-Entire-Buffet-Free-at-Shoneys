// change y transform of details page
window.addEventListener("scroll", function() {
	var scrollPos = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
	var detailsPos = 0.72 * scrollPos;
	document.documentElement.style.setProperty("--scrollPos", `${detailsPos}px`);
});

//declare array variables
const allArrays = {
	park: [],
	concert: [],
	restaurant: [],
	meetup: []
};

const itinObj = {
	park: {},
	concert: {},
	restaurant: {},
	meetup: {}
};

// web Component station

const searchResult = {
	concert: (object, i) => {
		return `
        <section >
        <button id="${i}" name="concert" class="button resultButton">${object.name}</button>
        </section>
        `;
	},

	park: (object, i) => {
		let parkAddress = JSON.parse(object.mapped_location.human_address);
		let parkData = `
        <section >
        <button title="${parkAddress.address}, ${parkAddress.city} ${parkAddress.state}" id="${i}" name="park" class="button resultButton">${object.park_name}</h1>
        </section>`;
		return parkData;
	},

	meetup: (object, i) => {
		return `
		<section >
		<button id="${i}" name="meetup" class="button resultButton">${object.name.text}</button>
		</section>
		`;
	},
	restaurant: (object, i) => {
		return `
        <section >
        <button title="${object.restaurant.location.address}" id="${i}" name="restaurant" class="button resultButton">${object.restaurant.name}</button>
        </section>
        `;
	}
};

const createItinerary = {
	concert: object => {
		return `
			<p class="iText">${object.name}</p>
			<img class="pinConcert" src="/src/images/pin.png" />
		`;
	},
	park: object => {
		return `
			<p class="iText">${object.park_name}</p>
			<img class="pinPark" src="/src/images/pin.png" />
		`;
	},
	meetup: object => {
		return `
			<p class="iText">${object.name.text}</p>
			<img class="pinMeetup" src="/src/images/pin.png" />
		`;
	},
	restaurant: object => {
		return `
			<p class="iText">${object.restaurant.name}</p>
			<img class="pinRestaurant" src="/src/images/pin.png"/>
		`;
	}
};

//API station

const API = {
	tmArray: search => {
		return fetch(
			`https://app.ticketmaster.com/discovery/v2/events/?keyword=${search}&city=nashville&apikey=lRJ3piseoa0cn3eSi7wBxk5W9Th0WQc3`
		)
			.then(events => events.json())
			.then(object => {
				console.log(object._embedded.events);
				return object._embedded.events;
			});
	},

	parkList: search => {
		return fetch(`https://data.nashville.gov/resource/74d7-b74t.json?$q=${search}`)
			.then(parkData => parkData.json())
			.then(parsedParkData => {
				console.table(parsedParkData);
				return parsedParkData;
				//renderParkData(parsedParkData)
			});
	},
	eventbrite: search => {
		return fetch(`https://www.eventbriteapi.com/v3/events/search/?q=${search}&location.address=nashville&token=U4TQ4FVUMOLUNIZEGIQX`, {
			headers: {
				Accept: "application/json"
			}
		})
			.then(object => object.json())
			.then(parsedObject => {
				console.table(parsedObject);
				return parsedObject.events;
			});
	},
	restaurantList: search => {
		return fetch(
			`https://developers.zomato.com/api/v2.1/search?entity_id=1138&entity_type=city&q=${search}&apikey=6e72e09f0a9e5501ab2d5645e8fac52d`
		)
			.then(result => result.json())
			.then(parsedResult => {
				console.log(parsedResult.restaurants);
				return parsedResult.restaurants;
			});
	}
};

//DOM station
const searchResultsContainer = document.querySelector("#search-results-container");
// loading spinner
const spinnerContainer = document.querySelector("#spinner-container");
const spinnerText = document.querySelector("#spinner-text");

// hides the details page and its wrapper
const detailsHide = () => {
	let details = document.querySelector("#details-page");
	details.classList = "details-hide";
	setTimeout(function() {
		details.classList = "hidden";
		document.querySelector("#details-wrapper").classList = "details-wrap-hide";
	}, 290);
};

const DOM = {
	tmResults: array => {
		let i = -1;
		allArrays.concert.length = 0;
		searchResultsContainer.innerHTML = "";
		spinnerContainer.style.display = "none";
		array.forEach(item => {
			i++;
			allArrays.concert[i] = item;
			searchResultsContainer.innerHTML += searchResult.concert(item, i);
		});
	},
	parkResult: data => {
		let i = -1;
		allArrays.park.length = 0;
		searchResultsContainer.innerHTML = "";
		spinnerContainer.style.display = "none";
		data.forEach(item => {
			i++;
			allArrays.park[i] = item;
			searchResultsContainer.innerHTML += searchResult.park(item, i);
		});
	},
	ebResults: array => {
		let i = -1;
		allArrays.meetup.length = 0;
		searchResultsContainer.innerHTML = "";
		spinnerContainer.style.display = "none";
		array.forEach(item => {
			i++;
			allArrays.meetup[i] = item;
			searchResultsContainer.innerHTML += searchResult.meetup(item, i);
			// console.log(i);
		});
	},
	restaurantResults: array => {
		let i = -1;
		allArrays.restaurant.length = 0;
		(searchResultsContainer.innerHTML = ""), (spinnerContainer.style.display = "none");
		array.forEach(item => {
			i++;
			allArrays.restaurant[i] = item;
			searchResultsContainer.innerHTML += searchResult.restaurant(item, i);
		});
	}
};

//array variables

//add event listeners to buttons

document.querySelector("#search-parks").addEventListener("click", event => {
	let searchTerm = document.querySelector("#search-bar").value;
	searchResultsContainer.innerHTML = "";
	spinnerContainer.style.display = "inline";
	spinnerText.innerHTML = "searching parks...";
	document.querySelector("#details-page").classList = "hidden";
	API.parkList(searchTerm).then(data => {
		DOM.parkResult(data);
		document.querySelector(".rightContainer").style.display = "block";
		document.querySelector(".itineraryWrapper").style.display = "flex";
		document.querySelector("#searchContainer").style.marginTop = "1em";
	});
});

document.querySelector("#search-concerts").addEventListener("click", event => {
	let searchTerm = document.querySelector("#search-bar").value;
	searchResultsContainer.innerHTML = "";
	spinnerContainer.style.display = "inline";
	spinnerText.innerHTML = "searching events...";
	document.querySelector("#details-page").classList = "hidden";
	API.tmArray(searchTerm).then(data => {
		DOM.tmResults(data);
		document.querySelector(".rightContainer").style.display = "block";
		document.querySelector(".itineraryWrapper").style.display = "flex";
		document.querySelector("#searchContainer").style.marginTop = "1em";
	});
});

document.querySelector("#search-meetups").addEventListener("click", event => {
	let searchTerm = document.querySelector("#search-bar").value;
	searchResultsContainer.innerHTML = "";
	spinnerContainer.style.display = "inline";
	spinnerText.innerHTML = "searching meetups...";
	document.querySelector("#details-page").classList = "hidden";
	API.eventbrite(searchTerm).then(data => {
		DOM.ebResults(data);
		document.querySelector(".rightContainer").style.display = "block";
		document.querySelector(".itineraryWrapper").style.display = "flex";
		document.querySelector("#searchContainer").style.marginTop = "1em";
	});
});

document.querySelector("#search-restaurants").addEventListener("click", event => {
	let searchTerm = document.querySelector("#search-bar").value;
	searchResultsContainer.innerHTML = "";
	spinnerContainer.style.display = "inline";
	spinnerText.innerHTML = "searching restaurants...";
	document.querySelector("#details-page").classList = "hidden";
	API.restaurantList(searchTerm).then(data => {
		DOM.restaurantResults(data);
		document.querySelector(".rightContainer").style.display = "block";
		document.querySelector(".itineraryWrapper").style.display = "flex";
		document.querySelector("#searchContainer").style.marginTop = "1em";
	});
});

const detailsContainer = {
	concert: object => {
		return `
		<div>
			<p class="iText">${object.name}</p>
		</div>
		`;
	},
	park: object => {
		return `
		<div>
			<p class="iText">${object.park_name}</p>
			<p class="iText">${object.mapped_location.human_address}</p>
			<p class="iText">${object.mapped_location.human_address}</p>
			<div id="map"></div>	
		</div>
		`;
	},
	meetup: object => {
		return `
			
		<div>
			<p class="iText">${object.name.text}</p>
		</div>
		
		`;
	},
	restaurant: object => {
		return `
			
		<div>
			<p class="iText">${object.restaurant.name}</p>
		</div>
		
		`;
	}
};

// puts the object into the correct itinerary container using object keys
const itinerarySelector = {
	park: (object, key) => {
		document.querySelector(".i1-park").innerHTML = createItinerary[key](object);
	},
	concert: (object, key) => {
		document.querySelector(".i1-concert").innerHTML = createItinerary[key](object);
	},
	restaurant: (object, key) => {
		document.querySelector(".i1-restaurant").innerHTML = createItinerary[key](object);
	},
	meetup: (object, key) => {
		document.querySelector(".i1-meetup").innerHTML = createItinerary[key](object);
	}
};

// contains the temprarily viewed object, id, and name attribute (to be used later as object keys)
const detailsObject = {
	object: {},
	key: {},
	id: {}
};

// pushes the clicked object to a temporary holding tank - detailsObject - and also passes along the id and name attribute
document.querySelector("#search-results-container").addEventListener("click", event => {
	let i = event.target.id;
	let key = event.target.name;
	detailsObject.object = allArrays[key][i];
	detailsObject.key = key;
	detailsObject.id = i;
	document.querySelector("#details-wrapper").classList = "details-wrap-show";
	document.querySelector("#details-page").classList = "details-show";
	document.querySelector("#details-container").innerHTML = detailsContainer[key](detailsObject.object);
	console.log(detailsObject);
});

// confirmSave
document.querySelector("#save-to-itinerary").addEventListener("click", event => {
	let i = detailsObject.id;
	let key = detailsObject.key;
	itinObj[key] = detailsObject.object;
	console.log(itinObj[key]);
	itinerarySelector[key](detailsObject.object, key);
	backgroundSetter[key]();
	detailsHide();
});

document.querySelector("#x-button").addEventListener("click", event => {
	detailsHide();
	let circle = document.querySelector("#x-circle");
	circle.classList = "circle-grow";
	setTimeout(function() {
		circle.classList = "";
	}, 200);
});

// called by save button using object keys
const backgroundSetter = {
	park: () => {
		document.querySelector(".i1-park").style.backgroundImage = "url('/src/images/park.jpg')";
	},
	concert: () => {
		document.querySelector(".i1-concert").style.backgroundImage = "url('/src/images/concert.jpg')";
	},
	restaurant: () => {
		document.querySelector(".i1-restaurant").style.backgroundImage = "url('/src/images/restaurant.jpg')";
	},
	meetup: () => {
		document.querySelector(".i1-meetup").style.backgroundImage = "url('/src/images/meetup.jpg')";
	}
};

document.querySelector("#btnSaveItinerary").addEventListener("click", e => {
	console.log(itinObj);
	saveItinerary(itinObj);
	
});


saveItinerary = (save) => {
	fetch("http://localhost:8088/itinerary", {
		method: 'POST',
		body: JSON.stringify(save),
		headers: {
			'Content-Type': 'application/json'
		} 
	 }).then (res => res.json()) 
	   .then(response => console.log('Success:', JSON.stringify(response)))
	   .catch(error => console.log('Error:', error));
	}