(function() {
"use strict";

angular.module('chGoogleMap.models').directive("circle",['$timeout', 'chCoordiante', 'chCircle', function($timeout, chCoordiante, chCircle){
  return {
    restrict:'AE',
    scope: {
      center:'=',
      radius:'=',
      options:'=?',
      events:'=?',
    },
    require:'^map',
    controller: ['$scope', function($scope){
      return {
        getPolygon: function(){return $scope.circle;}
      };
      
    }],
    link: function($scope, element, attrs, mapController){
      $scope.circle = chCircle.fromAttrs($scope).$googleCircle(mapController.getMap(), $scope, $scope.events);

      element.on('$destroy', function(s) {
        $scope.circle.setMap(null);
        $scope.circle = null;
      });

      $scope.$watch("center", function(newValue, oldValue){
        if(!angular.isDefined(newValue)) return;
        
        $timeout(function(){
          var newCoord = chCoordiante.fromAttr(newValue).$googleCoord();
          if($scope.circle) $scope.circle.setCenter(newCoord);
        });
      });

      $scope.$watch("radius", function(newValue, oldValue){
        if(!angular.isDefined(newValue)) return;
        
        $timeout(function(){
          if($scope.circle) $scope.circle.setRadius(newValue);
        });
      });

      $scope.$watchCollection("options", function(newValue, oldValue){
        if(angular.equals(newValue,oldValue)) return;
        $timeout(function(){
          $scope.circle.setOptions(newValue);
        });
      });

    },
  }
}])

})();