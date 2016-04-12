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