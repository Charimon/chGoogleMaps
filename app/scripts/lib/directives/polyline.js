(function() {
"use strict";

var $isTrue =  function(value){ return ['true', 'TRUE', 1, 'y', 'Y', 'yes', 'YES'].indexOf(value) !== -1;}

angular.module('chGoogleMap.models').directive("polyline",['$timeout', 'chPolyline', function($timeout, chPolyline){
  return {
    restrict:'AE',
    scope: {
      options:'=?',
      events:'=?',
    },
    require:'^map',
    controller: ['$scope', function($scope){
      return {
        getPolyline: function(){return $scope.polyline;}
      };
      
    }],
    link: function($scope, element, attrs, mapController){
      var a = chPolyline.fromAttrs($scope);
      $scope.polyline = a.$googlePolyline(mapController.getMap(), $scope, $scope.events);

      $scope.polyline.setEditable($isTrue(attrs.editable));
      $scope.polyline.setVisible(angular.isDefined(attrs.visible)?$isTrue(attrs.visible):true);

      element.on('$destroy', function(s) {
        $scope.polyline.setMap(null);
        $scope.polyline = null;
      });

      $scope.$watchCollection("options", function(newValue, oldValue){
        if(angular.equals(newValue,oldValue)) return;
        $timeout(function(){
          $scope.polyline.setOptions(newValue);
        });
      });

    },
  }
}])

})();