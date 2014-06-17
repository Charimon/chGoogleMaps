(function() {
"use strict";

//use this if you have under 400 markers, 1000 is pushing it, 10,000 becomes unresponsive
angular.module('chGoogleMap.models').directive("marker",['$timeout', 'chCoordiante', 'chMarker', function($timeout, chCoordiante, chMarker){
  return {
    restrict:'AE',
    scope: {
      position:'=',
      icon:'=?',
      options:'=?',
      events:'=?',
    },
    require:'^map',
    link: function($scope, element, attrs, mapController){
      $scope.marker = chMarker.fromAttrs($scope).$googleMarker(mapController.getMap(), $scope, $scope.events);

      element.on('$destroy', function(s) {
        $scope.marker.setMap(null);
        $scope.marker = null;
      });

      if($scope.$watchGroup) {
        $scope.$watchGroup(["position", "icon"], function(newValue, oldValue){
          $timeout(function(){
            if(!$scope.marker) return;

            if(angular.isDefined(newValue[0])){
              var newCoord = chCoordiante.fromAttr(newValue[0]).$googleCoord();
              $scope.marker.setPosition(newCoord);
            }
            $scope.marker.setIcon(newValue[1]);
          });
        });
      } else {
        $scope.$watch("icon", function(newValue, oldValue){
          $timeout(function(){
            if(!$scope.marker) return;
            $scope.marker.setIcon(newValue);
          });
        });

        $scope.$watch("position", function(newValue, oldValue){
          $timeout(function(){
            if(!$scope.marker) return;
            
            if(angular.isDefined(newValue)){
              var newCoord = chCoordiante.fromAttr(newValue).$googleCoord();
              $scope.marker.setPosition(newCoord);
            }
          });
        });
      }
      

      $scope.$watchCollection("options", function(newValue, oldValue){
        if(angular.equals(newValue,oldValue)) return;
        $timeout(function(){
          $scope.marker.setOptions(newValue);
        });
      });

    },
  }
}])

})();