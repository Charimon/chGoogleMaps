(function() {
"use strict";

angular.module('chGoogleMap.models').directive("path",['$timeout', 'chCoordiante', function($timeout, chCoordiante){
  return {
    restrict:'E',
    scope: {
      coordinates:'=',
      events:'=?',
    },
    require: ['?^polygon', '?^polyline'],
    link: function($scope, element, attrs, controllers){
      $timeout(function(){
        if(angular.isArray($scope.coordinates)) {
          var coordinates = [];
          angular.forEach($scope.coordinates, function(coordinate, i){
            coordinates.push(chCoordiante.fromAttr(coordinate).$googleCoord());
          });
          if(angular.isDefined(controllers[0]) && controllers[0].getPolygon()) controllers[0].getPolygon().setPath(coordinates);
          else if(angular.isDefined(controllers[1]) && controllers[1].getPolygon()) controllers[1].getPolyline().setPath(coordinates);
        }

        var path;
        if(angular.isDefined(controllers[0])) path = controllers[0].getPolygon().getPath();
        else if(angular.isDefined(controllers[1])) path = controllers[1].getPolyline().getPath();
        if(angular.isObject($scope.events) && path) {
          angular.forEach($scope.events, function(fn,key){
            if(angular.isFunction(fn)) {
              var objectToSend = null;
              if(angular.isDefined(controllers[0])) objectToSend = controllers[0].getPolygon();
              else if(angular.isDefined(controllers[1])) objectToSend = controllers[1].getPolyline();
              google.maps.event.addListener(path, key, function(){ $scope.events[key].apply($scope, [objectToSend, key, arguments]);});
            }
          });
        };
      });

      element.on('$destroy', function(s) {
        var obj = null;
        if(angular.isDefined(controllers[0])) obj = controllers[0].getPolygon();
        else if(angular.isDefined(controllers[1])) obj = controllers[1].getPolyline();
        if(obj) obj.setPath(null);
      });
    },
  }
}])


})();