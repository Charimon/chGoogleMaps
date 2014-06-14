(function() {
"use strict";

angular.module('chGoogleMap.models').directive("circle",['$timeout', 'chCoordiante', function($timeout, chCoordiante){
  return {
    restrict:'AE',
    scope: {
      path:'=',
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
      $scope.circle = new google.maps.Circle();
      //$timeout so as to not freeze up the map
      $timeout(function(){
        $scope.circle.setMap(mapController.getMap());

        if(angular.isObject($scope.events) ) {
          angular.forEach($scope.events, function(fn,key){
            if(angular.isFunction(fn)) {
              google.maps.event.addListener($scope.circle, key, function(){ $scope.events[key].apply($scope, [$scope.circle, key, arguments]);});
            }
          });
        };
      });

      element.on('$destroy', function(s) {
        $scope.circle.setMap(null);
        $scope.circle = null;
      });


    },
  }
}])

})();