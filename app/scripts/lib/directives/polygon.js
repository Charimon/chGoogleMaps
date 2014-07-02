(function() {
"use strict";

var $isTrue =  function(value){ return ['true', 'TRUE', 1, 'y', 'Y', 'yes', 'YES'].indexOf(value) !== -1;}

angular.module('chGoogleMap.models').directive("polygon",['$timeout', 'chPolygon', function($timeout, chPolygon){
  return {
    restrict:'AE',
    scope: {
      options:'=?',
      events:'=?',
      rightClickDelete:'=?',
    },
    require:'^map',
    controller: ['$scope', function($scope){
      return {
        getPolygon: function(){return $scope.polygon;}
      };
      
    }],
    link: function($scope, element, attrs, mapController){
      var p = chPolygon.fromAttrs($scope);
      $scope.polygon = p.$googlePolygon(mapController.getMap(), $scope, $scope.events);

      $scope.polygon.setEditable($isTrue(attrs.editable));
      $scope.polygon.setVisible(angular.isDefined(attrs.visible)?$isTrue(attrs.visible):true);

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