(function() {
"use strict";

//use this instead of 'marker'
angular.module('chGoogleMap.models').directive("markers",['$timeout', 'chCoordiante', 'chMarker', function($timeout, chCoordiante, chMarker){
  return {
    restrict:'E',
    scope: {
      data:'=',
      events:'=?',
      fit:'=?'
    },
    require:'^map',
    link: function($scope, element, attrs, mapController){
      $scope.markers = {};

      element.on('$destroy', function(s) {
        angular.forEach($scope.markers, function(marker, key){
          if(marker.$label) marker.$label.set('map', null);
          marker.setMap(null);
        });
        $scope.markers = {};
      });

      $scope.$watch("data", function(newValue, oldValue){
        $timeout(function(){
          //remove all old ones
          if(!angular.isDefined(newValue) || !angular.isArray(newValue) || newValue.length == 0) {
            angular.forEach($scope.markers, function(marker, key){
              if(marker.$label) marker.$label.set('map', null);
              marker.setMap(null);
            });
            $scope.markers = {};
          }

          var markers = {};
          var bounds = null;
          if($scope.fit) bounds = new google.maps.LatLngBounds();


          angular.forEach(newValue, function(item, i){
            var key;
            if(angular.isDefined(attrs.trackBy)) key = item[attrs.trackBy];
            else key = i;

            if(angular.isDefined($scope.markers[key])){
              var googleMarker = $scope.markers[key];
              markers[key] = chMarker.updateGoogleMapMarker(googleMarker, item, attrs);
            } else {
              if(angular.isDefined(markers[key])) throw "track by not unique";
              markers[key] = chMarker.fromItemAndAttr(item, attrs).$googleMarker(mapController.getMap(), $scope, $scope.events);

              if(bounds) bounds.extend(markers[key].getPosition());
            }
          });

          //remove markers that are no longer in data
          angular.forEach($scope.markers, function(value, key){
            if(!angular.isDefined(markers[key])){
              if(value.$label) value.$label.set('map', null);
              value.setMap(null);
            }
          });

          $scope.markers = markers;

          if(bounds && !bounds.isEmpty()) {
            mapController.getMap().fitBounds(bounds);
            $scope.fit = false;
          }

        });
      });

    },
  }
}])

})();