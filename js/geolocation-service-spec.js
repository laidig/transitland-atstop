ngDescribe({
  http: {
    get: { 'https://transit.land/api/v1/stops?lon=-122.162128&lat=37.757388&r=100':{
	"stops": [{
		"identifiers": ["gtfs://f-9q9-actransit/s/9903000"],
		"onestop_id": "s-9q9nu1s28p-macarthurblvd~88thav",
		"geometry": {
			"type": "Point",
			"coordinates": [-122.162128, 37.757388]
		},
		"name": "MacArthur Blvd:88th Av",
		"timezone": "America/Los_Angeles",
		"operators_serving_stop": [{
			"operator_name": "Alameda-Contra Costa Transit District",
			"operator_onestop_id": "o-9q9-actransit"
		}],
		"routes_serving_stop": [{
			"operator_name": "Alameda-Contra Costa Transit District",
			"operator_onestop_id": "o-9q9-actransit",
			"route_name": "57",
			"route_onestop_id": "r-9q9n-57"
		}, {
			"operator_name": "Alameda-Contra Costa Transit District",
			"operator_onestop_id": "o-9q9-actransit",
			"route_name": "680",
			"route_onestop_id": "r-9q9ng-680"
		}, {
			"operator_name": "Alameda-Contra Costa Transit District",
			"operator_onestop_id": "o-9q9-actransit",
			"route_name": "NX3",
			"route_onestop_id": "r-9q9n-nx3"
		}, {
			"operator_name": "Alameda-Contra Costa Transit District",
			"operator_onestop_id": "o-9q9-actransit",
			"route_name": "NXC",
			"route_onestop_id": "r-9q9n-nxc"
		}]
	}, {
		"identifiers": ["gtfs://f-9q9-actransit/s/1004270"],
		"onestop_id": "s-9q9nu1hswn-90thave~macarthurblvd<1004270",
		"geometry": {
			"type": "Point",
			"coordinates": [-122.161746, 37.755554]
		},
		"name": "90th Av:MacArthur Blvd",
		"tags": {
			"parent_station": "s-9q9nu1hswn-90thave~macarthurblvd"
		},
		"operators_serving_stop": [{
			"operator_name": "Alameda-Contra Costa Transit District",
			"operator_onestop_id": "o-9q9-actransit"
		}],
		"routes_serving_stop": [{
			"operator_name": "Alameda-Contra Costa Transit District",
			"operator_onestop_id": "o-9q9-actransit",
			"route_name": "652",
			"route_onestop_id": "r-9q9nu-652"
		}, {
			"operator_name": "Alameda-Contra Costa Transit District",
			"operator_onestop_id": "o-9q9-actransit",
			"route_name": "98",
			"route_onestop_id": "r-9q9ne-98"
		}]
	}]
  }
}
},
name: 'Service: Geolocation tests',
  modules: 'atstop',
  inject: 'GeolocationService',
  tests: function(deps) {
    it('should return nearby stops', function() {
        var lat = 37.757388;
        var lon = -122.162128;
        
        deps.GeolocationService.getStops(lat, lon).then(function(results) {
            expect(results.length).to.BeGreaterThan(0);
      });
    }
    );
}
});