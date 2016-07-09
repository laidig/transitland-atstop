/*jshint sub:true*/
angular.module('atstop.about.controller', ['configuration', 'filters'])


/**
 * @ngdoc controller
 * @description
 * Controller that used for showing About Information from config.js
 * Also has morphed into a settings page
 */
.controller('AboutCtrl', ['$log', '$cordovaAppVersion', '$rootScope', '$scope', '$ionicScrollDelegate', 'PRIV_POLICY_TEXT', 'SHOW_BRANDING', 'BRAND_ABOUT_TEXT', function($log, $cordovaAppVersion, $rootScope, $scope, $ionicScrollDelegate,
    PRIV_POLICY_TEXT, SHOW_BRANDING, BRAND_ABOUT_TEXT) {

        $scope.data = {
            version: "1.2.0",
            showBranding: SHOW_BRANDING,
            hideText: true,
            brandAboutText: BRAND_ABOUT_TEXT,
            privText: PRIV_POLICY_TEXT
        };

        $scope.toggleText = function() {
            // resize the content since the Privacy Policy text is too big
            $ionicScrollDelegate.resize();
            $scope.data.hideText = !$scope.data.hideText;
        };

        var init = (function() {
            // get app version
            // Disabled because this causes unpredictable behaviour in iOS9
/*            document.addEventListener("deviceready", function () {
                $cordovaAppVersion.getVersionNumber().then(function(version) {
                    $scope.data.version = version;
                });
            });*/
        })();
    }
]);
/*jshint sub:true*/
//nothing
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

angular.module('atstop', [
 'atstop.about.controller','atstop.atstop.controller',
 'atstop.favorites.controller', 'atstop.gohome.controller',
   'atstop.nearby.controller',
  'atstop.search.controller', 
 'atstop.atstop.service','atstop.datetime.service',
 'atstop.favorites.service', 'atstop.geolocation.service', 
  'atstop.search.service', 'atstop.searchHistory.service', 
  'atstop.directives', 'leaflet-directive','ionic',
    'ngCordova', 'angular-cache', 'angular-inview', 'timer'  
    ])

// global timeout variable for HTTP requests
.value('httpTimeout', 10000)

.constant('$ionicLoadingConfig', {
    template: '<ion-spinner></ion-spinner>',
    showBackdrop: false
})

.run(['$ionicPlatform', '$log', function($ionicPlatform, $log) {
    $ionicPlatform.ready(function() {

        $log.debug('yo yo');

        $cordovaSplashscreen.hide();
        navigator.splashscreen.hide();

        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }

        if (window.StatusBar) {
            StatusBar.styleDefault();
        }

    });
}])

// use Angular Cache by default
.run(['$http', 'CacheFactory', function($http, CacheFactory) {
  if (!CacheFactory.get('dataCache')) {
    $http.defaults.cache = CacheFactory('dataCache', {
        maxAge: 15 * 60 * 1000, // Items added to this cache expire after 15 minutes
        cacheFlushInterval: 60 * 60 * 1000, // This cache will clear itself every hour
        deleteOnExpire: 'aggressive' // Items will be deleted from this cache when they expire
    });
  }
}])

.run(['$rootScope', '$ionicHistory', '$ionicLoading', '$ionicPopup', '$cordovaNetwork', '$timeout', function($rootScope, $ionicHistory, $ionicLoading, $ionicPopup, $cordovaNetwork, $timeout) {

    // if 'loading:show' is broadcasted then show the loading indicator or hide if 'loading:hide' is broadcasted
    $rootScope.$on('loading:show', function() {
        $ionicLoading.show();
    });

    $rootScope.$on('loading:hide', function() {
        $ionicLoading.hide();
    });

    $rootScope.$on('requestRejection', function(obj, data) {
        $ionicLoading.hide();

        // if (data.config.url.indexOf("autocomplete") == -1) {
        //     var popup = $ionicPopup.alert({
        //         title: "Error",
        //         content: "Something went wrong. Please check your internet connection."
        //     });
        //     $timeout(function() {
        //         popup.close();
        //     }, 2000);
        // }

    });
}])

.config(['$httpProvider', '$ionicConfigProvider', function($httpProvider, $ionicConfigProvider) {
    $ionicConfigProvider.views.swipeBackEnabled(false);
    $ionicConfigProvider.tabs.position('bottom');

    if (ionic.Platform.isAndroid()) {
        $ionicConfigProvider.views.transition('none');
    }

    $httpProvider.interceptors.push(['$rootScope', function($rootScope) {
        return {
            request: function(config) {
                $rootScope.$broadcast('loading:show');
                return config;
            },
            requestError: function(rejection) {
                $rootScope.$broadcast('requestRejection', rejection);
                return rejection;
            },
            response: function(response) {
                $rootScope.$broadcast('loading:hide');
                return response;
            },
            responseError: function(rejection) {
                $rootScope.$broadcast('requestRejection', rejection);
                return rejection;
            }
        };
    }]);
}])

// use the logProvider instead of console.log
.config(['$logProvider', function($logProvider){
  // you are developing on a Mac or Linux, right?? otherwise add some || here with your dev platforms
  var platform = ionic.Platform.platform();
  if (platform === 'macintel' || platform === 'linux'){
    $logProvider.debugEnabled(true);
  }
  else {
    $logProvider.debugEnabled(false);
  }

}])

.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $stateProvider

    // abstract state for the tabs
        .state('tab', {
        url: "/tab",
        abstract: true,
        templateUrl: "templates/tabs.html"
    })

    .state('tab.home', {
        url: '/home',
        cache: false,
        views: {
            'tab-home': {
                templateUrl: 'templates/tab-home.html',
                controller: 'SearchCtrl'
            }
        }
    })

    .state('tab.geolocation', {
        url: '/geolocation/:latitude/:longitude/:address',
        cache: false,
        views: {
            'tab-home': {
                templateUrl: 'templates/tab-nearby-stops-and-routes.html',
                controller: 'NearbyStopsAndRoutesCtrl'
            }
        }
    })

    .state('tab.atstop', {
        url: '/atstop/:stopId/:stopName',
        cache: false,
        views: {
            'tab-home': {
                templateUrl: 'templates/atstop.html',
                controller: 'AtStopCtrl'
            }
        }
    })

    .state('tab.about', {
        url: '/about',
        views: {
            'tab-home': {
                templateUrl: 'templates/about.html',
                controller: 'AboutCtrl'
            }
        }
    })

    .state('tab.favorites', {
        url: '/favorites',
        cache: false,
        views: {
            'tab-favorites': {
                templateUrl: 'templates/tab-favorites.html',
                controller: 'FavoritesCtrl'
            }
        }
    })


    .state('tab.map-favorites', {
        url: '/map-favorites/:routeId/:routeName/:stopId',
        cache: false,
        views: {
            'tab-favorites': {
                templateUrl: 'templates/map.html',
                controller: 'MapCtrl'
            }
        }
    })

    .state('tab.nearby-stops-and-routes', {
        url: '/nearby-stops-and-routes',
        cache: false,
        views: {
            'tab-nearby-stops-and-routes': {
                templateUrl: 'templates/tab-nearby-stops-and-routes.html',
                controller: 'NearbyStopsAndRoutesCtrl'
            }
        }
    })

    .state('tab.map-gps', {
        url: '/map-gps/:routeId/:routeName/:stopId',
        cache: false,
        views: {
            'tab-nearby-stops-and-routes': {
                templateUrl: 'templates/map.html',
                controller: 'MapCtrl'
            }
        }
    });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/home');
}]);

/*jshint sub:true*/
angular.module('atstop.atstop.controller', ['configuration', 'filters'])
/**
 * @ngdoc controller
 * @description
 * Controller used for showing upcoming vehicles for specific stop.
 */
.controller('AtStopCtrl', ['$log', '$ionicScrollDelegate', '$scope', 'AtStopService', '$stateParams', '$q', '$ionicLoading', 'FavoritesService', '$timeout', '$filter', 'datetimeService', '$interval', '$location', function($log, $ionicScrollDelegate, $scope, AtStopService, $stateParams, $q, $ionicLoading, FavoritesService, $timeout, $filter, datetimeService, $interval, $location) {
        $scope.data = {
            "link": "map",
            "alerts": "",
            "responseTime": "",
            "loaded": false,
            "favClass": "",
            "results": [],
            "stopName": $stateParams.stopName,
            "notifications": '',
            "alertsHide": false,
            "alertsToggle": false,
            "stopId": $stateParams.stopId,
            "tips": "Pull down for instant refresh."
        };

        $scope.toggleFavorites = function() {
            if (FavoritesService.inFavorites($scope.data.stopId)) {
                FavoritesService.remove($scope.data.stopId);
                $scope.data.favClass = "";
            } else {
                FavoritesService.add($scope.data.stopId, $scope.data.stopName);
                $scope.data.favClass = "button-energized";
            }
        };

        var getBuses = function() {
            var busesDefer = $q.defer();
            AtStopService.getBuses($scope.data.stopId).then(function(results) {
                if (!angular.equals({}, results.arriving)) {
                    $scope.data.responseTime = $filter('date')(results.responseTimestamp, 'shortTime');
                    $scope.data.results = results.arriving;
                    $scope.data.notifications = "";
                } else {
                    $scope.data.results = "";
                    $scope.data.notifications = "We do not list any trips departing soon.";
                }

                if (results.alerts.length > 0) {
                    $scope.data.alertsHide = true;
                    $scope.data.alerts = results.alerts;
                    $log.debug($scope.data.alerts);
                } else {
                    $scope.data.alertsHide = false;
                }
                busesDefer.resolve();
            });

            busesDefer.promise.then(function() {
                $scope.data.loaded = true;
            });
        };

        $scope.refresh = function() {
            // restart 'refresh' timer
            $interval.cancel($scope.reloadTimeout);
            getBuses();
            $scope.reloadTimeout = $interval(getBuses, 35000);
            $scope.$broadcast('scroll.refreshComplete');
        };

        $scope.toggleAlerts = function() {
            $scope.data.alertsToggle = !$scope.data.alertsToggle;
            $ionicScrollDelegate.resize();
        };

        $scope.$on('$destroy', function() {
            if ($scope.reloadTimeout) {
                $interval.cancel($scope.reloadTimeout);
            }
        });

        var init = (function() {
            if ($location.$$path.indexOf("atstop-favorites") > -1) {
                $scope.data.link = "map-favorites";
            } else if ($location.$$path.indexOf("atstop-gps") > -1) {
                $scope.data.link = "map-gps";
            }

            if (FavoritesService.inFavorites($scope.data.stopId)) {
                $scope.data.favClass = "button-energized";
            } else {
                $scope.data.favClass = "";
            }

            getBuses();
            $scope.reloadTimeout = $interval(getBuses, 35000);
        })();
    }
]);
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
  .factory('AtStopService', ['$log', '$q', '$http', '$filter', 'httpTimeout', 'CacheFactory', 'datetimeService', 'API_END_POINT', 'TRANSITLAND_KEY', function($log, $q, $http, $filter, httpTimeout, CacheFactory, datetimeService, API_END_POINT, TRANSITLAND_KEY) {

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
  }]);

/*jshint sub:true*/

angular.module('configuration', [])
    .constant('MAP_TILES', 'http://{s}.tile.stamen.com/toner-lite/{z}/{x}/{y}.png')
    .constant('MAP_ATTRS', 'Map:<a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data:<a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.')
    .constant('API_END_POINT', 'https://transit.land/api/v1/')
    .constant('SEARCH_END_POINT', 'https://search.mapzen.com/v1/')
    .constant('SEARCH_API_KEY', 'search-VDAAm8r')
    .constant('TRANSITLAND_KEY', 'transitland-gyE87Ux')
    .constant('MAPBOX_KEY', '')
    .constant('SHOW_BRANDING', false)
    .constant('PRIV_POLICY_TEXT','')
    .constant('BRAND_ABOUT_TEXT','This is an example app for the transit.land API')
    //FYI: this currently is hard coded into the controller
    .constant('exampleSearches', {
        'exampleRoutes': [],
        'exampleStops': [],
        'exampleIntersections': []
    });
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

angular.module('atstop.datetime.service', ['ionic', 'configuration'])

/**
 * helper functions for date and time
 */
.factory('datetimeService', ['$log', '$timeout', function($log, $timeout) {
        /**
         * get human readable duration between times
         * @param timeSpan
         * @returns {{days: number, hours: number, minutes: number, seconds: number}}
         */
        var duration = function(timeSpan) {
            var days = Math.floor(timeSpan / 86400000);
            var diff = timeSpan - days * 86400000;
            var hours = Math.floor(diff / 3600000);
            diff = diff - hours * 3600000;
            var minutes = Math.floor(diff / 60000);
            diff = diff - minutes * 60000;
            var secs = Math.floor(diff / 1000);
            return {
                'days': days,
                'hours': hours,
                'minutes': minutes,
                'seconds': secs
            };
        };

        /**
         * get time between now and a time (hopefully in the future)
         * @param referenceTime a time (hopefully in the future)
         * @returns {number|*}
         */
        function getRemainingTime(referenceTime) {
            var now = moment().utc();
            var time;
            	// fixed in accordance with https://github.com/moment/moment/issues/1407
                if (referenceTime.length < 8){
                    time = moment(referenceTime) - now;
                }
                else{
                    time = moment(referenceTime, 'HH:mm:ss') - now;
                }
            if (time < 0 ){
                time = 0;
            }
            return time;
        }
        
        function getDate(){
            return moment().format('YYYY-MM-DD');
        }
        
        function getNextHalfHour(){
            hhstart = moment().format('HH:mm');
            hhend = moment().add(30,'m').format('HH:mm');
            hh = hhstart + ',' + hhend;
            return hh;
        }

        return {
            duration: duration,
            getRemainingTime: getRemainingTime,
            getDate: getDate,
            getNextHalfHour: getNextHalfHour 
        };
    }
]);
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

angular.module('atstop.directives', [])

.directive('ngTips', ['$timeout', '$rootScope', function($timeout, $rootScope) {
    $rootScope.tipCt = 0;
    return {
        restrict: 'E',
        replace: true,
        scope: {
            ngModel: '='
        },
        template: '<div class="tips">{{ngModel}}</div>',
        link: function(scope, element, attrs) {
            $rootScope.tipCt = ++$rootScope.tipCt;
            //only show tips a few times after app load
            if (scope.$root.tipCt < 3) {
                var to = $timeout(function() {
                    element.remove();
                }, 3000);

                scope.$on("$destroy", function() {
                    $timeout.cancel(to);
                });
            } else {
                element.remove();
            }
        }
    };
}])

.directive('appHeader', function() {
    return {
        restrict: 'E',
        scope: {},
        template: '<div style="padding-bottom: -100%; position: relative; text-align: center"><img src="img/logo.svg" style="width: 90%; height: auto;"> </div>'
    };
})

.directive('ngEnter', function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if (event.which === 13) {
                scope.$apply(function() {
                    scope.$eval(attrs.ngEnter);
                });
                event.preventDefault();
            }
        });
    };
});

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

angular.module('atstop.favorites.controller', ['configuration', 'filters'])
    /**
     * @ngdoc controller
     * @description
     * Controller used for showing favorites.
     */
    .controller('FavoritesCtrl', ['$log', '$scope', '$ionicLoading', 'FavoritesService', '$q', 'SHOW_BRANDING', function($log, $scope, $ionicLoading, FavoritesService, $q, SHOW_BRANDING) {
            $scope.data = {
                "loaded": false,
                "notifications": '',
                "showBranding": SHOW_BRANDING
            };

            $scope.remove = function(id) {
                FavoritesService.remove(id);
                get();
            };

            var get = function() {
                $scope.data.favoriteRoutes = [];
                $scope.data.favoriteStops = [];
                $scope.data.favoriteRouteMaps = [];
                var favoritesDefer = $q.defer();

                FavoritesService.get().then(function(results) {
                    if (Object.keys(results).length === 0) {
                        $scope.data.notifications = "You have not added any favorites. You can add favorites by clicking the star icon on routes, favorites, or maps.";
                    } else if (!angular.isUndefined(results) && results !== null) {
                        angular.forEach(results, function(value) {
                            if (value.type === 'R') {
                                $scope.data.favoriteRoutes.push(value);
                            } else if (value.type === 'RM') {
                                $scope.data.favoriteRouteMaps.push(value);
                            } else {
                                $scope.data.favoriteStops.push(value);
                            }
                        });
                        $scope.data.notifications = "";
                    }
                    favoritesDefer.resolve();
                });

                favoritesDefer.promise.then(function() {
                    $scope.data.loaded = true;
                });
            };

            var init = (function() {
                get();
            })();
        }
    ]);
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

angular.module('atstop.favorites.service', ['ionic', 'configuration'])

.factory('FavoritesService', ['$log', '$q', '$window', function($log, $q, $window) {
    var add = function(id, name, type) {
        // if type is not passed in, assume it is a stop. 
        type = type || 'S';

        var data = JSON.parse($window.localStorage['favorites'] || '{}');
        // favoriteCount exists in case a future version lets users reorder favorites.
        // This is also the reason that different types of favs are all in one object in LocalStorage.
        //var favoriteCount = JSON.parse($window.localStorage['favoriteCount'] || '0');

        //Route Maps and Routes would share a key and collide, so instead set the display ID/name.
        var dispId = id.replace('MAP', '');

        //favoriteCount = Object.keys(data).length++;

        data[id] = {
            "id": dispId,
            "name": name,
            "type": type
                //"order": favoriteCount
        };
        //$window.localStorage.setItem("favoriteCount", JSON.stringify(favoriteCount));
        $window.localStorage.setItem("favorites", JSON.stringify(data));
    };

    var remove = function(id) {
        var data = JSON.parse($window.localStorage['favorites'] || '{}');
        delete data[id];
        $window.localStorage.setItem("favorites", JSON.stringify(data));
    };

    var get = function() {
        var deferred = $q.defer();
        deferred.resolve(JSON.parse($window.localStorage.getItem("favorites") || '{}'));
        return deferred.promise;
    };

    var inFavorites = function(id) {
        id = id || '';
        var data = JSON.parse($window.localStorage['favorites'] || '{}');
        return !(angular.isUndefined(data[id]) || data[id] === null);
    };

    return {
        add: add,
        remove: remove,
        get: get,
        inFavorites: inFavorites
    };
}]);
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

angular.module('filters', [])

/**
 * modify a link to open URL in a device's browser via the inAppBrowser plugin
  */
.filter('hrefToJS', ['$sce', '$sanitize', function($sce, $sanitize) {
    return function(text) {
        return $sce.trustAsHtml($sanitize(text).replace(/href="([\S]+)"/g, "onClick=\"window.open('$1', '_system', 'location=yes')\""));
    };
}])

.filter('isUndefinedOrEmpty', function() {
    return function(a) {
        return angular.isUndefined(a) || null === a;
    };
})
/**
 *
 */
.filter('encodeStopName', function() {
    return function(input) {
        input = input || '';
        input = input.replace("/", " & ");
        input = input.replace("\\", " & ");
        return input;
    };
})
/**
 * filter for cleaning up shorthand in Service Alerts/SituationExchange/etc
 * takes in String or Array(String)
 * @returns String
 */
    .filter('alertsFilter', function() {
        // TODO: think about porting regexes from this list: https://github.com/michaelsand/AccessibleMTA
        return function(input) {
            var safeDescription = Array.isArray(input) ? input.join(" ") : input;

            // cleaning up shorthand
            var regexToFix = /^b\/d/i;
            safeDescription = safeDescription.replace(regexToFix, "In Both Directions:");

            regexToFix = /^s\/b/i;
            safeDescription = safeDescription.replace(regexToFix, "Southbound:");

            regexToFix = /^n\/b/i;
            safeDescription = safeDescription.replace(regexToFix, "Northbound:");

            return safeDescription;
        };
    })

// always round down to nearest min, do not show time if less than 1 minute away
.filter('durationView', ['$log', 'datetimeService', function($log, datetimeService) {
        return function(input) {
            var duration = datetimeService.duration(input);
            var minutes = duration.minutes;
            var displayTime = '';
            // if time expires and goes negative, hours goes a little screwy
            if (duration.hours > 0 && duration.hours < 2) {
                minutes = minutes + duration.hours * 60;
            }

            if (duration.minutes > 0) {
                displayTime = minutes + " min";
            }
            else{
                displayTime = 'Due';
            }
            return displayTime;
        };
    }
]);

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
.factory('GeolocationService', ['$log', '$q', '$http', 'httpTimeout', 'API_END_POINT', function($log, $q, $http, httpTimeout, API_END_POINT) {

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
}]);
/*jshint sub:true*/
angular.module('atstop.gohome.controller', ['configuration'])

/**
 * @ngdoc controller
 * @description
 * Controller that makes tabs go to the root (cleaning Tab Histories)
 */
.controller('GoHomeCtrl', ['$scope', '$rootScope', '$state', '$ionicHistory', function($scope, $rootScope, $state, $ionicHistory) {
    var clearHistory = function() {
        $ionicHistory.clearHistory();
        $ionicHistory.nextViewOptions({
            historyRoot: true
        });
    };

    $scope.goHomeTab = function() {
        clearHistory();
        $state.go('tab.home');
    };

    $scope.goFavsTab = function() {
        clearHistory();
        $state.go('tab.favorites');
    };
}]);
/*jshint sub:true*/
angular.module('atstop.localstorage.service', ['ionic', 'configuration'])

.factory('$localstorage', ['$log', '$window', function($log, $window) {
        return {
            set: function(key, value) {
                $window.localStorage[key] = value;
            },
            get: function(key, defaultValue) {
                return $window.localStorage[key] || defaultValue;
            },
            setObject: function(key, value) {
                $window.localStorage[key] = JSON.stringify(value);
            },
            getObject: function(key) {
                return JSON.parse($window.localStorage[key] || '{}');
            }
        };
    }
]);
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

angular.module('atstop.nearby.controller', ['configuration', 'filters'])

/**
 * @ngdoc controller
 * @description
 * Controller that used for showing the nearby stops for specific location from geolocations.
 */
.controller('NearbyStopsAndRoutesCtrl', ['$log', '$ionicLoading', '$stateParams', '$window', '$location', '$scope', 'GeolocationService', 'AtStopService', '$q', '$ionicPopup', '$cordovaGeolocation', '$filter', 'leafletData', '$ionicScrollDelegate', '$timeout', '$interval', 'MAPBOX_KEY', 'MAP_TILES', 'MAP_ATTRS', function($log, $ionicLoading, $stateParams, $window, $location, $scope, GeolocationService, AtStopService, $q, $ionicPopup, $cordovaGeolocation, $filter, leafletData, $ionicScrollDelegate, $timeout, $interval, MAPBOX_KEY, MAP_TILES, MAP_ATTRS) {
        $scope.markers = {};
        $scope.paths = {};
        $scope.url = "atstop";
        $scope.left = false;
        $scope.center = {};
        $scope.data = {
            "inRouteView": false,
            "title": "Nearby Stops",
            "loaded": true,
            "showMap": true,
            "stops": [],
            "routes": [],
            "markers": {},
            "lat": "",
            "lon": "",
            "notifications": "",
            "val": false,
            "showRoutes": false,
            "showStops": true,
            "results": [],
            "mapHeight": Math.floor(document.getElementsByTagName('html')[0].clientHeight / 2) - 90,
            "listHeight": Math.floor(document.getElementsByTagName('html')[0].clientHeight / 2),
            "tips": "Pull the list to refresh",
            "nearbyStops": []
        };

        // this array holds stops we want to query arrivals from.
        var stopsInTimeout = [];

        var lastZoom;
        var defaultZoom = 15;

        var cancelReloadTimeout = function() {
            if ($scope.reloadTimeout) {
                $interval.cancel($scope.reloadTimeout);
            }
        };
        var setReloadTimeout = function() {
            $scope.reloadTimeout = $interval(
                function () {
                    tick(); }, 60000
            );
        };
        var resetReloadTimeout = function() {
            cancelReloadTimeout();
            setReloadTimeout();
        };

        /**
         * move back from stop detail
         */
        $scope.back = function() {
            $scope.data.inRouteView = false;
            resetReloadTimeout();
            $scope.reinitialize();
        };

        $scope.toggleStopAlerts = function(stop){
            stop.showAlerts = !stop.showAlerts;
        };

        $scope.reinitialize = function() {
            $scope.data.notifications = "";
            resetReloadTimeout();

            if ($location.$$path === "/tab/nearby-stops-and-routes") {
                getNearbyStopsAndRoutesGPS();
            } else {
                getNearbyStopsAndRoutes($scope.lat, $scope.lon);
            }

            tick();
            $scope.$broadcast('scroll.refreshComplete');
        };

        /**
         * once a line comes into view check if that stop is in the array to query for. If not, add it.
         * params are passed in via angular-inview
         * @param index
         * @param inview
         * @param inviewpart
         * @param event
         * @returns {boolean}
         */
        $scope.lineInView = function(index, inview, inviewpart, event) {
            if (inview === true) {
                var stopInArray = stopsInTimeout.some(function(stop) {
                    return stop === event.inViewTarget.id;
                });
                if (!stopInArray) {
                    stopsInTimeout.push(event.inViewTarget.id);
                    ionic.throttle(tick(), 500);
                }
            }

            return false;
        };

        /**
         *
         * the meat of the controller
         * queries for data on each stop in the stopsInTimeout array
         * runs on when stops are added to timeouts, as well as on refresh
         */
        var tick = function() {
            var arrivals = {};
            var alerts = {};
            var promises = [];
            var defer = $q.defer();
                // add the stop to the list of promises to query below, building an object along the way

                    AtStopService.getMultipleStops(stopsInTimeout).then(function(results) {
                        if (!angular.equals({}, results.arriving)) {
                          angular.forEach($scope.data.stops, function(s) {
                            // console.log(JSON.stringify(s, null, " "));
                            // console.log(JSON.stringify(arrivals.stops[s.id], null, " "));
                            s.arriving = results.stops[s.id];
                            s.loaded = true;
                            s.showAlerts = false;

                          });
                        }
                    });
            //avoid apply() if it is already active.
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        }

        /**
         * Returns nearby stops from the GeolocationService
         * @param lat
         * @param lon
         * @param showCurrLocation boolean on whether to show current location
         */
        var getNearbyStopsAndRoutes = function(lat, lon, showCurrLocation) {
            if (showCurrLocation === undefined) {
                showCurrLocation = true;
            }
            GeolocationService.getStops(lat, lon).then(function(results) {
                if (!angular.isUndefined(results) && results !== null && results.length > 0) {
                    //reset the list of stops we're interested in.
                    stopsInTimeout = [];

                    angular.forEach(results, function(stop) {
                        stop['dist'] = getDistanceInM(lat, lon, stop['lat'], stop['lon']);
                    });
                    $scope.data.stops = results;

                    if (showCurrLocation) {
                        $scope.data.stops.push({
                            id: "current_location",
                            lat: lat,
                            lon: lon
                        });
                    }

                    showNearbyStops();
                    $scope.data.notifications = "";
                    $timeout(function() {
                        $ionicScrollDelegate.scrollTop();
                    });
                } else {
                    $scope.data.notifications = "No nearby stops found.";
                }
            });
        };
        /**
         * activates location services and passes this location on to the getNearbyStopsAndRoutes function
         */

        var getNearbyStopsAndRoutesGPS = function() {

            $scope.loading = true;

            var timeoutVal = 10000;
            var fired = false;
            var timeout = $timeout(function() {
                $scope.data.notifications = "Pull to refresh.";
                $scope.loading = false;
                if ($scope.left !== true) {
                    var popup = $ionicPopup.alert({
                        content: "Cannot access your position. Check if location services are enabled."
                    });
                    $timeout(function() {
                        popup.close();
                    }, 3000);
                } else {
                    $log.debug("You left the current page! Destroying ...");
                }
            }, timeoutVal + 5000);

            // Unfortunately, this function is asynchronous. So, we cannot cancel it.
            // However, we have a trick for this. DO NOT show the popup if a user left the page.
            $cordovaGeolocation.getCurrentPosition({
                    enableHighAccuracy: false,
                    timeout: timeoutVal,
                    maximumAge: 0
                }).then(
                    function(position) {
                        $log.debug(position);
                        $scope.loading = false;
                        $timeout.cancel(timeout);
                        $scope.data.notifications = "";
                        $scope.data.val = true;
                        getNearbyStopsAndRoutes(position.coords.latitude, position.coords.longitude);
                    },
                    function(error) {
                        $log.debug(error);
                        $scope.data.notifications = "Pull to refresh.";
                        $ionicLoading.hide();
                        $timeout.cancel(timeout);
                        if ($scope.left !== true) {
                            var popup = $ionicPopup.alert({
                                content: "Cannot access your position. Check if location is enabled."
                            });
                            $timeout(function() {
                                popup.close();
                            }, 3000);
                        } else {
                            $log.debug("You left the current page! Destroying ...");
                        }
                    }
                )
                .finally(function() {
                    $scope.data.notifications = "Pull to refresh.";
                    $scope.loading = false;
                    $timeout.cancel(timeout);
                });
        };
        /**
         * draws nearby stops already in $scope
         */
        var showNearbyStops = function() {
            $scope.markers = {};
            $scope.paths = {};
            leafletData.getMap().then(function (map) {
                map.closePopup();
            });

            var stops = [];
            angular.forEach($scope.data.stops, function (v, k) {
                if (v["id"] != "current_location") {
                    stops['s' + k] = {
                        lat: v["lat"],
                        lng: v["lon"],
                        stopId: v["id"],
                        stopName: $filter('encodeStopName')(v['name']),
                        icon: {
                            iconUrl: 'img/stop_icons/stop.svg',
                            iconSize: [20, 20]
                        },
                        focus: false
                    };
                } else {
                    //console.log(v["lat"], v["lon"]);
                    stops['currentLocation'] = {
                        lat: parseFloat(v["lat"]),
                        lng: parseFloat(v["lon"]),
                        stopId: v["currentLocation"],
                        stopName: "Current Location",
                        icon: {
                            iconUrl: 'img/stop_icons/stop-blue.svg',
                            iconSize: [20, 20]
                        },
                        focus: false,
                        clickable: false
                    };
                }
            });

            $scope.markers = stops;
            leafletData.getMap().then(function (map) {

                var zoomPromise= getCurrentZoom().then(function(currentZoom){
                     // zoom to default if user is far out.
                    var newZoom = (currentZoom <= defaultZoom || angular.isUndefined(currentZoom)) ? defaultZoom : currentZoom;

                    // but don't refocus if user is zoomed too far in.
                    if (newZoom < 17){
                        map.setView($scope.markers['s0'], newZoom, {
                            animate: true
                    });
                    }
                });

            });

        };

        /**
         * initialize map
         */
        var map = function() {
            //var mapCenter = {};

            angular.extend($scope, {
                events: {
                    markers: {
                        enable: ['click', 'dragend', 'zoomstart', 'zoomend'],
                        logic: 'emit'
                    }
                },
                center: $scope.center,
                defaults: {
                    tileLayer: MAP_TILES,
                    tileLayerOptions: {
                        attribution: $filter('hrefToJS')(MAP_ATTRS)
                    },
                    scrollWheelZoom: true,
                    key: MAPBOX_KEY,
                    zoomControl: false
                },
                options: {
                    reuseTiles: true,
                },
                markers: {},
                paths: {}
            });

            leafletData.getMap().then(function(map) {
                map.attributionControl.setPrefix('');
            });
        };

        /**
         * when passed in a route, get and display polylines for that route
         * does nothing for transitland
         * @param route
         */
        $scope.showRoutePolylines = function(route) {
            $scope.paths = {};
        };

        var showBusMarkers = function(route) {
            leafletData.getMap().then(function(map) {
                map.closePopup();
            });

        };

        /**
         * refresh specific route
         * @param route
         * @param stop
         * @param lat
         * @param lon
         * @param name
         */
        $scope.showCurrentStop = function(route, stop, lat, lon, name) {

            $scope.data.inRouteView = true;
            $interval.cancel($scope.reloadTimeout);
            drawCurrentStop(route, stop, lat, lon, name);

            //timeout for refreshing information associated with this route at this stop
            $scope.reloadTimeout = $interval(function() {
                drawCurrentStop(route, stop, lat, lon, name);
            }, 35000);
        };

        /**
         * show current stop on the map
         * @param route
         * @param stop
         * @param lat
         * @param lon
         * @param name
         */
        var drawCurrentStop = function(route, stop, lat, lon, name) {
            $scope.markers = {};
            leafletData.getMap().then(function(map) {
                map.closePopup();
            });

            $scope.markers['currentStop'] = {
                lat: lat,
                lng: lon,
                icon: {
                    iconUrl: 'img/stop_icons/stop-blue.svg',
                    iconSize: [20, 20]
                },
                focus: false,
                stopId: stop,
                stopName: $filter('encodeStopName')(name)
            };

                leafletData.getMap().then(function (map) {
                    map.closePopup();
                    map.setView($scope.markers['currentStop'], 13, {
                        animate: true
                    });
                });
            showBusMarkers(route);
        };

        /**
         * when user clicks on a stop on the map, scroll to that stop on the list
         * @param location index to slide to
         */
        var slideTo = function(location) {
            location = $location.hash(location);
            $timeout(function() {
                $ionicScrollDelegate.anchorScroll("#" + location);
            });
        };

        /**
        * returns the current zoom via a promise
        * First, tries to get Leaflet zoom level
        * else, revert to default zoom
        */
        var getCurrentZoom = function(args) {

            var zoomDefer = $q.defer();
            var zoom;

            leafletData.getMap().then(function (map) {
                    mapZoom = map._zoom;

                    if (isInt(mapZoom)){
                        zoom = mapZoom;
                    }
                    else {
                        $log.debug('using default zoom');
                        zoom = defaultZoom;
                    }
                    zoomDefer.resolve(zoom);
            });
            return zoomDefer.promise;
        };
        /**
         * called in certain cases when moving map.
         * @param event leaflet event
         * @param args leaflet args
         */
        var mapMoveAndReload = function(event, args){
            // angular-leaflet center bound to scope lags the actual map center for some reason... D'oh!
            //console.log('angular-leaflet center', $scope.center.lat, $scope.center.lng);

            // don't bother if user has chosen a route to view
            if (!$scope.data.inRouteView) {

                leafletData.getMap().then(function (map) {
                    // $log.debug('moving to', map.getCenter().lat, map.getCenter().lng);
                    var lat = map.getCenter().lat;
                    var lng = map.getCenter().lng;

                    ionic.debounce(getNearbyStopsAndRoutes(lat, lng, false), 500);
                    $scope.lat = lat;
                    $scope.lon = lng;

                });
            }
        };

        /**
         * when the map is dragged, move and reload stops
         */
        $scope.$on('leafletDirectiveMap.dragend', function(event, args){
            var zoomPromise= getCurrentZoom().then(function(z){
                if (z >= defaultZoom) {
                    mapMoveAndReload(event, args);
               }
            });
        });
        /**
         * when zooming in past a certain level, move and reload stops
         */
        $scope.$on('leafletDirectiveMap.zoomend', function(event, args){

            var zoomPromise= getCurrentZoom().then(function(zoom){
                if (zoom >= defaultZoom  && lastZoom < zoom ){
                    mapMoveAndReload(event, args);
                }
                // else {
                //     $scope.data.notifications = "Zoom in to see stops"
                // }
            });
        });

        /**
         * before zooming, cache the zoom level
         */
        $scope.$on('leafletDirectiveMap.zoomstart', function(event, args){
            var zoomPromise= getCurrentZoom().then(function(z){
                lastZoom = z;
            });
        });

        /**
         * on map marker click event, display popup
         * if a stop, scroll to that stop on the list (which then displays arrivals for said stop)
         */
        $scope.$on('leafletDirectiveMarker.click', function(event, args) {
            var object = $scope.markers[args.modelName];
            var content = '';
            var latlng = [];
            var popup = L.popup();
            if ($filter('isUndefinedOrEmpty')(object.stopName)) {
                content = "Vehicle " + object.vehicleId + "<br> <h4>" + object.destination + "</h4>" + "<br> <h5>Next Stop: " + object.nextStop + "</h5>";
            } else {
                if (object.stopName === "Current Location") {
                    content = "<p>Current Location</p>";
                } else {
                    slideTo(object.stopId);
                    content = '<p>' + object.stopName + '</p>' + '<a href="#/tab/' + $scope.url + '/' + object.stopId + '/' + object.stopName + '" class="button button-clear button-full button-small">See upcoming buses</a>';
                }
            }

            latLng = [object.lat, object.lng];
            popup.setContent(content).setLatLng(latLng);

            leafletData.getMap().then(function(map) {
                popup.openOn(map);
            });
        });
        /**
         *  destroy the controller.
         *  fired when leaving the view.
         */
        $scope.$on('$destroy', function() {
            $scope.left = true;
            if ($scope.reloadTimeout) {
                $interval.cancel($scope.reloadTimeout);
            }
        });

        var getDistanceInM = function(lat1, lon1, lat2, lon2) {
            var R = 6371;
            var dLat = deg2rad(lat2 - lat1);
            var dLon = deg2rad(lon2 - lon1);
            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = R * c * 1000;
            return parseInt(d, 10);
         };

        var deg2rad = function(deg) {
            return deg * (Math.PI / 180);
        };


        var isInt = function(value) {
            if (isNaN(value)) {
                return false;
            }
            var x = parseFloat(value);
            return (x | 0) === x;
        };

        /**
         * init function
         */
        var init = (function() {
            map();
            if ($location.$$path === "/tab/nearby-stops-and-routes") {
                $scope.data.title = "Nearby Stops";
                $scope.url = "atstop-gps";
                getNearbyStopsAndRoutesGPS();
            } else {
                $scope.data.title = $stateParams.address;
                getNearbyStopsAndRoutes($stateParams.latitude, $stateParams.longitude);
            }

            tick();
            setReloadTimeout();
        })();
    }
]);


angular.module('atstop.routing.service', ['ionic', 'configuration'])
  .factory('RoutingService',
    ['$log', '$q', '$http', '$filter', 'httpTimeout', 'CacheFactory', 'datetimeService', 'VALHALLA_END_POINT', 'VALHALLA_KEY', function($log, $q, $http, $filter, httpTimeout, CacheFactory, datetimeService, VALHALLA_END_POINT, VALHALLA_KEY) {

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

    }]);

angular.module('atstop.search.controller', ['configuration', 'filters'])

/**
* @ngdoc controller
 * @description
 * Controller used for searching using autocomplete API.
 */
.controller('SearchCtrl', ['$log', '$rootScope', '$scope', '$location', 'SearchHistoryService', '$filter', '$ionicLoading', '$ionicPopup', '$ionicPlatform', 'SearchService', 'SHOW_BRANDING', '$ionicTabsDelegate', function($log, $rootScope, $scope, $location, SearchHistoryService, $filter, $ionicLoading, $ionicPopup, $ionicPlatform, SearchService, SHOW_BRANDING,  $ionicTabsDelegate) {

        $scope.go = function(path) {
            console.log(path);
            $location.path(path);
        };

        $scope.data = {
            "results": [],
            "searchKey": '',
            "notifications": '',

            exampleIntersections: [
               "Tribune Tower", "Transamerica Pyramid", "Roma Termini"
            ],
            "searches": [],
            "showSearches": true,
            "showDefaultTips": true,
            "showBranding": SHOW_BRANDING
        };

        /**
        * @function autocomplete
        * @
        **/

        $scope.autocomplete = function() {
            if ($scope.data.searchKey.length > 0) {
                SearchService.autocomplete($scope.data.searchKey).then(
                    function(matches) {
                        if (!angular.isUndefined(matches) && matches !== null && matches.length > 0) {
                            $scope.data.results = matches;
                            $scope.data.notifications = "";
                        } else {
                            $scope.data.results = [];
                            $scope.data.notifications = "No matches";
                        }
                    }
                );
            } else {
                $scope.data.results = [];
                $scope.data.notifications = "";
            }
        };

        // set no sched svc message.
        /**
         * logic for settng no scheduled service message based on response of type route.
         * @param  {Object} matches [description]
         */
        var handleRouteSearch = function(matches) {
            // console.log(Object.keys(matches.directions).length);

            if (Object.keys(matches.directions).length > 1) {
                // if one direction on the route has no service-- handle on route/stop page.
                if (matches.directions[0].hasUpcomingScheduledService || matches.directions[1].hasUpcomingScheduledService) {
                    $log.debug('service in both directions');
                    $scope.go("/tab/route/" + matches.id + '/' + matches.shortName);
                } else if (!matches.directions[0].hasUpcomingScheduledService && !matches.directions[1].hasUpcomingScheduledService) {
                    $log.debug('no service in both directions');
                    noSchedService(matches.shortName);
                } else {
                    $log.debug('service?');
                }
            }
            // but if there is only one direction on the route
            else {
                $log.debug('1D 4eva!');
                var directionName = Object.keys(matches.directions)[0];
                if (!matches.directions[directionName].hasUpcomingScheduledService) {
                    $log.debug('1direction with no service');
                    noSchedService(matches.shortName);
                } else {
                    $log.debug('1direction with service');
                    $scope.go("/tab/route/" + matches.id + '/' + matches.shortName);
                }
            }
        };

        var noSchedService = function(routeDirection) {
            $scope.data.notifications = "There is no scheduled service on this route at this time.";
        };
/**
 * enter searches if only one autocomplete result is returned.
 * @param  {String} term [description]

 */
        $scope.searchAndGo = function(term) {
            // for search page, enter searches if only one autocomplete result is returned.
            //
            if ($scope.data.results.length === 1) {
                term = $scope.data.results[0];
            }

            SearchService.search(term).then(
                function(matches) {
                    SearchHistoryService.add(matches);
                    switch (matches.type) {
                        case "RouteResult":
                            handleRouteSearch(matches);
                            break;
                        case "StopResult":
                            $scope.go("/tab/atstop/" + matches.id + '/' + $filter('encodeStopName')(matches.name));
                            break;
                        case "GeocodeResult":
                            $scope.go("/tab/geolocation/" + matches.latitude + '/' + matches.longitude + '/' + matches.formattedAddress);
                            break;
                        default:
                            $scope.data.results = [];
                            $scope.data.notifications = "No matches";
                            //console.log("undefined type");
                            $log.debug("undefined type");
                            break;
                    }
                }
            );
        };

        /**
         * clear previous searches array
         */
        $scope.clearSearches = function() {
            SearchHistoryService.clear();
            $scope.data.searches = [];
            $scope.data.showSearches = false;
            $scope.data.showDefaultTips = true;
        };

        /**
         * Initialize and grab previously stored searches.
         */
        var init = (function() {

            SearchHistoryService.fetchAll().then(function(results) {
                if (results.length > 0) {
                    $scope.data.searches = results;
                    $scope.data.showSearches = true;
                    $scope.data.showDefaultTips = false;
                } else {
                    $scope.data.searches = [];
                    $scope.data.showSearches = false;
                }
            });
        })();
    }
]);

/**
 * Created by tonylaidig on 12/10/15.
 */
angular.module('atstop.search.service', ['ionic', 'configuration'])
.factory('SearchService', ['$log', '$q', '$http', 'httpTimeout', 'SEARCH_END_POINT', 'SEARCH_API_KEY', function($log, $q, $http, httpTimeout, SEARCH_END_POINT, SEARCH_API_KEY) {
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
}]);
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

angular.module('atstop.searchHistory.service', ['ionic', 'configuration'])

.factory('SearchHistoryService', ['$log', '$q', '$window', function($log, $q, $window) {
    var insert = function(term, title, data) {
        var searches = Array.prototype.slice.call(JSON.parse($window.localStorage['searches'] || '[]'));

        if (searches.length > 0) {
            angular.forEach(searches, function(val, key) {
                if (val.term == term) {
                    searches.splice(key, 1);
                }
            });

            if (searches.length >= 5) {
                searches.splice(0, 1);
            }
        }

        searches.push({
            term: term,
            title: title,
            data: data
        });

        $window.localStorage.setItem("searches", JSON.stringify(searches));
    };

    var add = function(matches) {
        switch (matches.type) {
            case "RouteResult":
                insert(matches.id, matches.shortName, matches);
                break;
            case "StopResult":
                insert(matches.id, matches.name, matches);
                break;
            case "GeocodeResult":
                insert(matches.formattedAddress, matches.formattedAddress, matches);
                break;
            default:
                $log.debug("undefined type");
                break;
        }
    };

    var fetchAll = function() {
        var deferred = $q.defer();
        deferred.resolve(Array.prototype.slice.call(JSON.parse($window.localStorage['searches'] || '[]')).reverse());
        return deferred.promise;
    };

    var clear = function() {
        $window.localStorage.removeItem("searches");
    };

    return {
        add: add,
        fetchAll: fetchAll,
        clear: clear
    };
}]);