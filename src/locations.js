// Locations Objects and Knockout ViewModel ---------------

import ko from 'knockout';
import * as Map from './map';
import * as Data from './locationsData';

// Expose js object of each location referenced by id
export let locationsModel = {};

// Track currently selected location
let currentLocation;

// Model Objects ------------------------------------------

let LocationType = function (data) {
	this.id = ko.observable(data.id);
	this.description = ko.observable(data.description);
};

let Location = function (data, selectedLocationTypes) {
	this.id = ko.observable(data.id);
	this.title = ko.observable(data.title);
	this.location = ko.observable(data.location);
	this.foursquareId = ko.observable(data.foursquareId);
	this.typeId = ko.observable(data.typeId);

	this.visible = ko.computed(function () {
		let selectedLocationTypeIds = selectedLocationTypes().map(obj => obj.id);
		return !(selectedLocationTypeIds.indexOf(this.typeId()) === -1);
	}, this);

	this.selected = ko.observable(false);

	this.mapMarker = Map.markers[data.id];
};

// ViewModel ----------------------------------------------

let LocationsViewModel = function () {
	let self = this;

	// Observables
	this.allLocationTypes = ko.observableArray([]);
	this.selectedLocationTypes = ko.observableArray([]);
	Data.getLocationTypesData().forEach(function (locationType) {
		self.allLocationTypes.push(locationType);
		self.selectedLocationTypes.push(locationType);
	});

	this.locationList = ko.observableArray([]);
	Data.getLocationsData().forEach(function (location) {
		const loc = new Location(location, self.selectedLocationTypes);
		self.locationList.push(loc);
		locationsModel[location.id] = loc;
	});

	// Functions
	this.setCurrentLocation = function (locationSelected) {
		if (currentLocation) {
			// Deselect Map UI
			Map.deactivateMarker(currentLocation.mapMarker);

			// Deselect Knockout UI
			deselectLocation(currentLocation);
		}

		// Select Knockout UI
		selectLocation(locationSelected);

		// Select Map UI
		Map.activateMarker(locationSelected.mapMarker);
	};

	this.filtersUpdate = function () {
		self.locationList().forEach(function (location) {
			if (location.visible()) {
				if(!location.selected()) {
					location.mapMarker.setMap(Map.map);
				}
			} else {
				if (location.selected()) {
					// Deselect Map UI
					Map.deactivateMarker(currentLocation.mapMarker);

					// Deselect Knockout UI
					deselectLocation(currentLocation);
				}
				location.mapMarker.setMap(null);
			}
		});
	};
};

export function deselectLocation(location) {
	location.selected(false);
	currentLocation = null;
}

export function selectLocation(location) {
	location.selected(true);
	currentLocation = location;
}

export function applyBindings() {
	ko.applyBindings(new LocationsViewModel());
}