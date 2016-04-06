/**
 * Created by tonylaidig on 12/10/15.
 */
angular.module('atstop.search.service', ['ionic', 'configuration'])
.factory('SearchService', function($log, $q, $http, httpTimeout, SEARCH_END_POINT, SEARCH_API_KEY) {
    /**
     * Autocomplete
     * @param searchKey text entered in
     * @returns {Array<String>} array of results
     */
    
    
    var autocomplete = function(searchKey) {
        var deferred = $q.defer();
        var matches = [];

        var responsePromise = $http.get(SEARCH_END_POINT + "autocomplete", {
                params: {
                    api_key: SEARCH_API_KEY,
                    text: searchKey
                },
                cache: true,
                timeout: httpTimeout
            })
            .success(function(results, status, header, config) {
                // build array of strings from data
                var resultArray = [];
                angular.forEach(results.features, function(val){
                    resultArray.push(val.properties.name);
                });
                matches = resultArray;
                
            })
            .error(function(data, status, header, config) {
                $log.debug('error');
            });

        responsePromise.then(function() {
            deferred.resolve(matches);
        });

        return deferred.promise;
    };
    /**
     * search!
     * @param term Term to search for
     * @returns {*} appropriately formatter result-- Route, Stop, or Geolocation
     */
    var search = function(term) {
        var deferred = $q.defer();
        var matches = {};

        var responsePromise = $http.get(SEARCH_END_POINT + "search", {
                params: {
                    api_key: SEARCH_API_KEY,
                    text: term
                },
                cache: true,
                timeout: httpTimeout
            })
            .success(function(data, status, header, config) {
                // Lazy 
                if (data.features.length > 0) {
                    matchesData = data.features[0];
                            matches = {
                                type: "GeocodeResult",
                                formattedAddress: matchesData.properties.label,
                                latitude: matchesData.geometry.coordinates[1],
                                longitude: matchesData.geometry.coordinates[0]
                            };
                }
            })
            .error(function(data, status, header, config) {
                $log.debug('error');
            });

        responsePromise.then(function() {
            deferred.resolve(matches);
        });

        return deferred.promise;
    };

    return {
        autocomplete: autocomplete,
        search: search
    };
});