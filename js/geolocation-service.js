/*jshint sub:true*/

/**
 * Copyright (c) 2015 Metropolitan Transportation Authority
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 *
 * @authors https://github.com/camsys/onebusaway-nyc-atstop/graphs/contributors
 */

angular.module('atstop.geolocation.service', ['ionic', 'configuration'])
/**
 * Service for returning nearby stops
 */
.factory('GeolocationService', function($log, $q, $http, httpTimeout, API_END_POINT) {

        /**
         * @typedef Stop
         * @type Object
         * @property {number} lat Latitude
         * @property {number} lon Longitude
         * @property {String} id Id of stop
         * @property {String} name name of stop
         */
        
        /**
         * get stops near coordinates
         * @param lat
         * @param lon
         * @returns {array<Stop>}
         */
    var getStops = function(lat, lon) {
        var deferred = $q.defer();
        var stops = [];

        var responsePromise = $http.get(API_END_POINT + "stops", {
                params: {
                    //key: API_KEY,
                    lat: lat,
                    lon: lon,
                    r: 200
                },
                cache: true,
                timeout: httpTimeout
            })
            .success(function(data, status, header, config) {
                
                angular.forEach(data.stops, function (v){
                    
                    var thisStop = {};
                    thisStop.lat = v.geometry.coordinates[1];
                    thisStop.lon = v.geometry.coordinates[0];
                    thisStop.id = v.onestop_id;
                    thisStop.name = v.name;
                    
                    stops.push(thisStop);
                });
                
            })
            .error(function(data, status, header, config) {
                $log.debug('error');
            });

        responsePromise.then(function() {
            deferred.resolve(stops);
        });

        return deferred.promise;
    };

    return {
        getStops: getStops
    };
});