(function() {
"use strict";

angular.module('chGoogleMap.models').directive("polygon",['$timeout', 'chCoordiante', function($timeout, chCoordiante){
  return {
    restrict:'AE',
    scope: {
      path:'=',
      options:'=?',
      events:'=?',
    },
    require:'^map',
    controller: ['$scope', function($scope){
      return {
        getPolygon: function(){return $scope.polygon;}
      };
      
    }],
    link: function($scope, element, attrs, mapController){
      $scope.polygon = new google.maps.Polygon();
      //$timeout so as to not freeze up the map
      $timeout(function(){
        $scope.polygon.setMap(mapController.getMap());

        if(angular.isObject($scope.events) ) {
          angular.forEach($scope.events, function(fn,key){
            if(angular.isFunction(fn)) {
              google.maps.event.addListener($scope.polygon, key, function(){ $scope.events[key].apply($scope, [$scope.polygon, key, arguments]);});
            }
          });
        };
      });

      element.on('$destroy', function(s) {
        $scope.polygon.setMap(null);
        $scope.polygon = null;
      });


    },
  }
}])

})();