(function() {
"use strict";

var $isTrue =  function(value){ return ['true', 'TRUE', 1, 'y', 'Y', 'yes', 'YES'].indexOf(value) !== -1;}

angular.module('chGoogleMap.models').directive("polygon",['$timeout', 'chCoordiante', function($timeout, chCoordiante){
  return {
    restrict:'AE',
    scope: {
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
      $scope.polygon.setOptions(angular.extend({}, $scope.options));

      $scope.polygon.setEditable($isTrue(attrs.editable));
      $scope.polygon.setVisible(angular.isDefined(attrs.visible)?$isTrue(attrs.visible):true);
      

      //$timeout so as to not freeze up the map
      $timeout(function(){
        $scope.polygon.setMap(mapController.getMap());

        if(angular.isObject($scope.events) ) {
          angular.forEach($scope.events, function(fn,key){
            if(angular.isFunction(fn)) {
              google.maps.event.addListener($scope.polygon, key, function(){ $scope.events[key].apply($scope, [$scope, key, arguments]);});
            }
          });
        };
      });

      element.on('$destroy', function(s) {
        $scope.polygon.setMap(null);
        $scope.polygon = null;
      });

      $scope.$watchCollection("options", function(newValue, oldValue){
        if(angular.equals(newValue,oldValue)) return;
        $timeout(function(){
          $scope.polygon.setOptions(newValue);
        });
      });

    },
  }
}])

})();