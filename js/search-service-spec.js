ngDescribe({
  name: 'Autocomplete',
  modules: 'atstop.search.service',
  inject: 'SearchService',
  tests: function(deps) {
    fit('should return something for autocomplete', function() {
        deps.SearchService.autocomplete('union square').then(function(results){
            expect(results.length).to.BeGreaterThan(0);
        });
    });
  }
});