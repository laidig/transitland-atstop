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

angular.module('atstop.atstop.service', ['ionic', 'configuration'])

  /**
   * Service for information about a particular stop
   * It is possible to refactor this to use another realtime API spec by changing parameters, URL, and responsePromise
   */
  .factory('AtStopService', function($log, $q, $http, $filter, httpTimeout, CacheFactory, datetimeService, API_END_POINT, TRANSITLAND_KEY) {

    if (!CacheFactory.get('atStopCache')) {
      CacheFactory('atStopCache', {
        maxAge: 90000, // Items added to this cache expire after 90s
        cacheFlushInterval: 60 * 60 * 1000, // This cache will clear itself every hour
        deleteOnExpire: 'aggressive' // Items will be deleted from this cache when they expire
      });
    };

    /**
     * calculate time to arrival from clock times
     * @param results returned from this service
     */
    var updateArrivalTimes = function(results) {
      angular.forEach(results, function(val, key) {
        angular.forEach(val['distances'], function(v, k) {
          v.arrivingIn = datetimeService.getRemainingTime(v.expectedArrivalTime);
        });
      });

    };

    function getRouteIdFromOneStop(routeId){
          var routeComponentArray = routeId.split("-");
          var routeName = routeComponentArray[routeComponentArray.length -1].toUpperCase();
          return routeName;
          }

    /**
     * core exposed function of this service
     * @param either a stop ID or an object of parameters including \{stop, sort\}
     * @returns {*} an object formatted for the V/VM
     *
     * { "arriving": {  "r-dp3t-3": {
         *    "name": "3",
        *    "distances": [ {
        *     "routeId": "r-dp3t-3",
        *     "name": "3",
        *     "distance": "",
        *     "destination": "95th/CSU",
        *     "progress": "normalProgress",
        *     "expectedArrivalTime": "00:30:57",
        *     "arrivingIn": 1448329
        *    },{
        *     "routeId": "r-dp3t-3",
        *     "name": "3",
        *     "distance": "",
        *     "destination": "95th/CSU",
        *     "progress": "normalProgress",
        *     "expectedArrivalTime": "00:10:57",
        *     "arrivingIn": 248329
        *    }] } },
        * "alerts": "",
        * "responseTimestamp": "2016-04-30T00:06:48-04:00",
        * "stopId": "s-dp3wq41bvy-michigan~illinois" }
     *
     */
    var getBuses = function(params) {
      var stop;
      if (params.hasOwnProperty('stop')) {
        stop = params.stop;
      } else { stop = params; }
      if (params.hasOwnProperty('sort')) {
        sort = params.sort;
      } else { sort = true; }

      var deferred = $q.defer();
      var buses = {
        arriving: {},
        alerts: "",
        responseTimestamp: "",
        stopId: stop
      };

      var getParams = {
        //http://transit.land/api/v1/schedule_stop_pairs?origin_onestop_id=s-9q9nu1sk25-macarthurblvd~8658
        //&date=2016-04-03&origin_departure_between=12:00,12:30

        api_key: TRANSITLAND_KEY,
        date : datetimeService.getDate(),
        origin_departure_between: datetimeService.getNextHalfHour(),
        origin_onestop_id: stop,
        active: 'true'
      };
      if (params.hasOwnProperty('line')) {
        getParams.LineRef = params.line;
      }



      /**
       * This is the meat of the return from this Service
       */
      var responsePromise = $http.get(API_END_POINT + "schedule_stop_pairs", {
          params: getParams,
          timeout: httpTimeout,
          cache: CacheFactory.get('atStopCache')
        })
        .success(function(data, status, header, config) {
          buses.responseTimestamp = moment().format();

          if (data.schedule_stop_pairs.length > 0) {
            var tmp = [];
            var grouped_tmp = [];
            var grouped = {};

            angular.forEach(data.schedule_stop_pairs, function(value, key) {

              var routeName = getRouteIdFromOneStop(value.route_onestop_id);

              tmp.push({
                routeId: routeId,
                name: routeName,
                distance: '',
                destination: value.trip_headsign,
                progress: 'normalProgress',
                expectedArrivalTime: value.origin_arrival_time
              });
            });


            grouped_tmp = _.groupBy(tmp, "routeId");
            angular.forEach(grouped_tmp, function(val, key) {
              var tmp = _.groupBy(val, "name");
              angular.forEach(tmp, function(v, k) {
                grouped[key] = {
                  name: k,
                  distances: v
                };
              });
            });
            buses.arriving = grouped;

            updateArrivalTimes(buses.arriving);


          } else {
            // TODO: check for sched svc and return something else
          }

        })
        .error(function(data, status, header, config) {
          $log.debug('error');
        });

      responsePromise.then(function() {
        deferred.resolve(buses);
      });

      return deferred.promise;
    };
    /**
     * { "arriving": {  "r-dp3t-3": {
         *    "name": "3",
        *    "distances": [ {
        *     "routeId": "r-dp3t-3",
        *     "name": "3",
        *     "distance": "",
        *     "destination": "95th/CSU",
        *     "progress": "normalProgress",
        *     "expectedArrivalTime": "00:30:57",
        *     "arrivingIn": 1448329
        *    }] } },
        * "alerts": "",
        * "responseTimestamp": "2016-04-30T00:06:48-04:00",
        * "stopId": "s-dp3wq41bvy-michigan~illinois" }
     * @param stopArray
     */
    var getMultipleStops = function(stopArray){
      var deferred = $q.defer();
      var stopArrivals ={};
      var arriving = {};

      var getParams = {
        //http://transit.land/api/v1/schedule_stop_pairs?origin_onestop_id=s-9q9nu1sk25-macarthurblvd~8658
        //&date=2016-04-03&origin_departure_between=12:00,12:30

        api_key: TRANSITLAND_KEY,
        date : datetimeService.getDate(),
        origin_departure_between: datetimeService.getNextHalfHour(),
        origin_onestop_id: stopArray.join(","),
        active: 'true'
      };

      var responsePromise = $http.get(API_END_POINT + "schedule_stop_pairs", {
        params: getParams,
        timeout: httpTimeout,
        cache: CacheFactory.get('atStopCache')
      }).success(function(data, status, header, config) {
        arriving.responseTimestamp = moment().format();
        stopArrivals = _.chain(data.schedule_stop_pairs)
          .map(function (val) {
            var obj = {};
            obj.stopId = val.origin_onestop_id;
            obj.routeId = getRouteIdFromOneStop(val.route_onestop_id);
            obj.name = val.routeName;
            obj.distance=  '';
            obj.destination=  val.trip_headsign;
            // obj.progress: 'normalProgress'
            obj.expectedArrivalTime = val.origin_arrival_time;
            obj.arrivingIn = datetimeService.getRemainingTime(obj.expectedArrivalTime);
            return obj;
          })
          .groupBy("stopId")
          .value();
        arriving.stops = stopArrivals;
      })
      responsePromise.then(function() {
        deferred.resolve(arriving);
      });

      return deferred.promise;
    };

    return {
      getBuses: getBuses,
      getMultipleStops:getMultipleStops
    };
  });
