
angular.module('atstop.routing.service', ['ionic', 'configuration'])
  .factory('RoutingService',
    function($log, $q, $http, $filter, httpTimeout, CacheFactory, datetimeService, VALHALLA_END_POINT, VALHALLA_KEY) {

      if (!CacheFactory.get('routeCache')) {
        CacheFactory('routeCache', {
          maxAge: 3600000, // Items added to this cache expire after 1h
          cacheFlushInterval: 60 * 60 * 1000, // This cache will clear itself every hour
          deleteOnExpire: 'aggressive' // Items will be deleted from this cache when they expire
        });
      };

      /*

       */
      var getRoute = function(loc1lat, loc1lon, loc2lat, loc2lon){
        var locations = [{
          lat: loc1lat,
          lon: loc1lon
        }, {
          lat: loc2lat,
          lon: loc2lon
        }];

        var getParams = {
          api_key: VALHALLA_KEY,
          locations: JSON.stringify(locations),
          costing: "multimodal",
          date_time: 0 // only show routes valid now for now
        }

        var responsePromise = $http.get(VALHALLA_END_POINT + "route", {
          params: getParams,
          timeout: httpTimeout,
          cache: CacheFactory.get('route')
        })
          .success(function(data, status, header, config) {
              
          });


      }

    });
