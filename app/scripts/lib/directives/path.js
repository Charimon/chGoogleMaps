(function() {
"use strict";

angular.module('chGoogleMap.models').directive("path",['$timeout', 'chCoordiante', function($timeout, chCoordiante){
  return {
    restrict:'AE',
    scope: {
      coordinates:'=',
      events:'=?',
    },
    require: '^polygon',
    link: function($scope, element, attrs, polygonController){
      $timeout(function(){
        if(angular.isArray($scope.coordinates)) {
          var coordinates = [];
          angular.forEach($scope.coordinates, function(coordinate, i){
            coordinates.push(chCoordiante.fromAttr(coordinate).$googleCoord());
          });
          polygonController.getPolygon().setPath(coordinates);
        }

        var path = polygonController.getPolygon().getPath();
        if(angular.isObject($scope.events) ) {
          angular.forEach($scope.events, function(fn,key){
            if(angular.isFunction(fn)) {
              google.maps.event.addListener(path, key, function(){ $scope.events[key].apply($scope, [polygonController.getPolygon(), key, arguments]);});
            }
          });
        };
      });

      element.on('$destroy', function(s) {
        polygonController.getPolygon().setPath(null);
      });
    },
  }
}])


})();