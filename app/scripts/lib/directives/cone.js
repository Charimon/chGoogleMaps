(function() {
"use strict";

angular.module('chGoogleMap.models').directive("cone",['$timeout', 'chCoordiante', 'chCone', function($timeout, chCoordiante, chCone){
  return {
    restrict:'AE',
    scope: {
      center:'=',
      radius:'=',
      start:'=',
      end:'=',
      options:'=?',
      events:'=?',
    },
    require:'^map',
    controller: ['$scope', function($scope){
      return {
        getPolygon: function(){return $scope.cone;}
      };
      
    }],
    link: function($scope, element, attrs, mapController){
      $scope.cone = chCone.fromAttrs($scope).$googleCone(mapController.getMap(), $scope, $scope.events);

      element.on('$destroy', function(s) {
        $scope.cone.setMap(null);
        $scope.cone = null;
      });

      // $scope.$watch("center", function(newValue, oldValue){
      //   if(!angular.isDefined(newValue)) return;
        
      //   $timeout(function(){
      //     var newCoord = chCoordiante.fromAttr(newValue).$googleCoord();
      //     if($scope.cone) $scope.cone.setCenter(newCoord);
      //   });
      // });

      // $scope.$watch("radius", function(newValue, oldValue){
      //   if(!angular.isDefined(newValue)) return;
        
      //   $timeout(function(){
      //     if($scope.cone) $scope.cone.setRadius(newValue);
      //   });
      // });

      // $scope.$watchCollection("options", function(newValue, oldValue){
      //   if(angular.equals(newValue,oldValue)) return;
      //   $timeout(function(){
      //     $scope.cone.setOptions(newValue);
      //   });
      // });

    },
  }
}])

})();