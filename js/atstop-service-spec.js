ngDescribe({
  name: 'Service: At Stop Service tests',
  modules: 'atstop',
  inject: 'AtStopService',
  tests: function(deps) {
    it('should return results for a stop', function() {
      var stop = 'MTA_400861';
      deps.AtStopService.getBuses(stop).then(function(results) {
        expect(Object.keys(data.arriving).length).toBeGreaterThan(1);
      });
    });

    it('should return results for one route at a stop', function() {
      var stop = 'MTA_400861';
      var line = 'MTA NYCT_M7';
      var params = {
        'stop': stop,
        'line': line
      };
      var data = {};
      deps.AtStopService.getBuses(params).then(function(results) {
        expect(Object.keys(data.arriving).length).toBeEqualTo(1);
      });
    });
  }
});