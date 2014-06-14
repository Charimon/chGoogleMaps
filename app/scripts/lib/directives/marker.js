(function() {
"use strict";

angular.module('chGoogleMap.models').directive("marker",['$timeout', 'chCoordiante', function($timeout, chCoordiante){
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
      $scope.marker = new google.maps.Marker();

      //$timeout so as to not freeze up the map
      $timeout(function(){
        $scope.marker.setPosition(chCoordiante.fromAttr($scope.position).$googleCoord());
        $scope.marker.setMap(mapController.getMap());

        if(angular.isObject($scope.events) ) {
          angular.forEach($scope.events, function(fn,key){
            if(angular.isFunction(fn)) {
              google.maps.event.addListener($scope.marker, key, function(){ $scope.events[key].apply($scope, [$scope.marker, key, arguments]);});
            }
          });
        };
      });

      element.on('$destroy', function(s) {
        $scope.marker.setMap(null);
        $scope.marker = null;
      });

      $scope.$watch("position", function(newValue, oldValue){
        if(!angular.isDefined(newValue)) return;
        
        $timeout(function(){
          var newCoord = chCoordiante.fromAttr(newValue).$googleCoord();
          if($scope.marker) $scope.marker.setPosition(newCoord);
        });
      });

      $scope.$watch("icon", function(newValue, oldValue){
        if(!angular.isDefined(newValue) && !angular.isDefined(oldValue)) return;
        
        $timeout(function(){
          if($scope.marker) $scope.marker.setIcon(newValue);
        });
      });

    },
  }
}])

})();