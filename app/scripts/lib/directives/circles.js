(function() {
"use strict";

angular.module('chGoogleMap.models').directive("circles",['$timeout', 'chCoordiante', 'chCircle', function($timeout, chCoordiante, chCircle){
  return {
    restrict:'AE',
    scope: {
      data:'=',
      events:'=?',
    },
    require:'^map',
    controller: ['$scope', function($scope){
      return {
        getPolygon: function(){return $scope.circle;}
      };
      
    }],
    link: function($scope, element, attrs, mapController){
      $scope.circles = {};
      
      element.on('$destroy', function(s) {
        angular.forEach($scope.circles, function(circle, key){
          circle.setMap(null);
        });
        $scope.circles = {};
      });

      $scope.$watch("data", function(newValue, oldValue){
        $timeout(function(){
          //remove all old ones
          if(!angular.isDefined(newValue) || !angular.isArray(newValue) || newValue.length == 0) {
            angular.forEach($scope.circles, function(circle, key){circle.setMap(null);});
            $scope.circles = {};
          }

          var circles = {};

          angular.forEach(newValue, function(item, i){
            var key;
            if(angular.isDefined(attrs.trackBy)) key = item[attrs.trackBy];
            else key = i;

            if(angular.isDefined($scope.circles[key])) $scope.circles[key].setMap(null);
            circles[key] = chCircle.fromItemAndAttr(item, attrs).$googleCircle(mapController.getMap(), $scope, $scope.events);

          });

          //remove circles that are no longer in data
          angular.forEach($scope.circles, function(value, key){
            if(!angular.isDefined(circles[key])) value.setMap(null);
          });

          $scope.circles = circles;

        });
      });

    },
  }
}])

})();