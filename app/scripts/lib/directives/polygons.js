(function() {
"use strict";

var $isTrue =  function(value){ return ['true', 'TRUE', 1, 'y', 'Y', 'yes', 'YES'].indexOf(value) !== -1;}

angular.module('chGoogleMap.models').directive("polygons",['$timeout', 'chCoordiante', 'chPolygon', function($timeout, chCoordiante, chPolygon){
  return {
    restrict:'E',
    scope: {
      data:'=?',
      path:'=',
      options:'=?',
      events:'=?',
      pathEvents:'=?',
    },
    require:'^map',
    link: function($scope, element, attrs, mapController){
      $scope.polygons = {};

      element.on('$destroy', function(s) {
        angular.forEach($scope.polygons, function(polygon, key){
          polygon.setMap(null);
        });
        $scope.polygons = {};
      });

      $scope.$watch("data", function(newValue, oldValue){
        $timeout(function(){
          //remove all old ones
          if(!angular.isDefined(newValue) || !angular.isArray(newValue) || newValue.length == 0) {
            angular.forEach($scope.polygons, function(polygon, key){polygon.setMap(null);});
            $scope.polygons = {};
          }

          var polygons = {};
          var bounds;
          if($scope.fit) bounds = new google.maps.LatLngBounds();


          angular.forEach(newValue, function(item, i){
            var key;
            if(angular.isDefined(attrs.trackBy)) key = item[attrs.trackBy];
            else key = i;

            if(angular.isDefined($scope.polygons[key])){
              polygons[key] = $scope.polygons[key];
            } else {
              if(angular.isDefined(polygons[key])) throw "track by not unique";
              polygons[key] = chPolygon.fromItemAndAttr(item, attrs).$googlePolygon(mapController.getMap(), $scope, $scope.events);

              // if(bounds) bounds.extend(polygons[key].getPosition());
            }
          });

          //remove polygons that are no longer in data
          angular.forEach($scope.polygons, function(value, key){
            if(!angular.isDefined(polygons[key])) value.setMap(null);
          });

          $scope.polygons = polygons;

          if(bounds && !bounds.isEmpty()) mapController.getMap().fitBounds(bounds);

        });
      });

    },
  }
}])

})();