(function() {
"use strict";

var $isTrue =  function(value){ return ['true', 'TRUE', 1, 'y', 'Y', 'yes', 'YES'].indexOf(value) !== -1;}
var $isFalse = function(value){ return ['false', 'FALSE', 0, 'n', 'N', 'no', 'NO'].indexOf(value) !== -1;} 


//directives: map, marker, polygon, path
angular.module('chGoogleMap.models').directive("map",['$timeout', 'chCoordiante', function($timeout, chCoordiante){
  var DEFAULTS = {
    mapTypeId: google.maps.MapTypeId.ROADMAP
  }

  return {
    restrict:'AE',
    scope: {
      zoom:'=',
      center:'=',
      options:'=?',
      events:'=?',
      bounds:'=?',
      dragging:'=?', //boolean becomes true when dragstart and false when dragend
    },
    controller: ['$scope', function($scope){
      return {
        getMap: function(){ return $scope.map;}
      };
      
    }],
    template:"<div class='map'><div class='map-containter'></div><div ng-transclude style='display: none'></div></div>",
    replace:true,
    transclude:true,
    link: function($scope, element, attrs){
      var $element = angular.element(element);
      var opts = {
        center:chCoordiante.fromAttr($scope.center).$googleCoord(),
        zoom:$scope.zoom,
        draggable: $isTrue(attrs.draggable),
      };

      if(angular.isDefined(attrs.type)) opts.mapTypeId = google.maps.MapTypeId[attrs.type.toUpperCase()];

      $scope.map = new google.maps.Map($element.find('div')[0], angular.extend(DEFAULTS, $scope.options, opts));

      var dragging;
      google.maps.event.addListener($scope.map, "dragstart", function(){
        dragging = true;
        $scope.$evalAsync(function(s){
          if(dragging) s.dragging = dragging;
        });
      });
      google.maps.event.addListener($scope.map, "dragend", function(){
        dragging = false;
        $scope.$evalAsync(function($scope){
          if(!dragging) $scope.dragging = dragging;
        });
      });
      google.maps.event.addListener($scope.map, "drag", function(){
        var center = $scope.map.center;
        $scope.$evalAsync(function($scope){
          if(angular.isDefined($scope.center) && angular.isDefined($scope.center.latitude) && angular.isDefined($scope.center.longitude)) {
            $scope.center.latitude = center.lat();
            $scope.center.longitude = center.lng();
          };
        });
      });
      google.maps.event.addListener($scope.map, "zoom_changed", function(){
        $scope.$evalAsync(function($scope){
          $scope.zoom = $scope.map.zoom;
        });
      });
      
      var settingCenterFromScope = false;
      google.maps.event.addListener($scope.map, "center_changed", function(){
        var center = $scope.map.center;
        if(settingCenterFromScope) return;
        
        $scope.$evalAsync(function($scope){
          if(angular.isDefined($scope.center) && angular.isDefined($scope.center.latitude) && angular.isDefined($scope.center.longitude)) {
            if($scope.center.latitude != center.lat()) $scope.center.latitude = center.lat();
            if($scope.center.longitude != center.lng()) $scope.center.longitude = center.lng();
          }
        });

      });
      google.maps.event.addListener($scope.map, "idle", function(){
        var bounds = $scope.map.getBounds();
        var ne = bounds.getNorthEast();
        var sw = bounds.getSouthWest();
        $scope.$evalAsync(function($scope){
          if(angular.isDefined($scope.bounds)) {
            $scope.bounds.northeast = {latitude: ne.lat(), longitude: ne.lng()};
            $scope.bounds.southwest = {latitude: sw.lat(), longitude: sw.lng()};
          }
        });
      });

      if(angular.isObject($scope.events) ) {
        angular.forEach($scope.events, function(fn,key){
          if(angular.isFunction(fn)) {
            google.maps.event.addListener($scope.map, key, function(){
              $scope.events[key].apply($scope, [$scope, key, arguments]);
            });
          }
        });
      };

      $scope.$watchCollection("center", function(newValue, oldValue){
        if(!angular.isDefined(newValue) || dragging) return;
        
        $timeout(function(){
          var newCoordinate = chCoordiante.fromAttr(newValue);
          if(newCoordinate.$googleCoord().equals($scope.map.center)) return;

          settingCenterFromScope = true;
          if($isTrue(attrs.pan) && $scope.zoom == $scope.map.zoom) $scope.map.panTo(newCoordinate.$googleCoord());
          else $scope.map.setCenter(newCoordinate.$googleCoord());
          settingCenterFromScope = false;
        });
      });
      $scope.$watch("zoom", function(newValue, oldValue){
        if(!angular.isDefined(newValue)) return;
        
        $timeout(function(){
          if(!angular.equals(newValue, $scope.map.zoom)) $scope.map.setZoom(newValue);
        });
      });
      $scope.$watchCollection("bounds", function(newValue, oldValue){
        if(!angular.isDefined(newValue) || dragging || !angular.isDefined(newValue.northeast) || !angular.isDefined(newValue.southwest)) return;
        
        $timeout(function(){
          var neCoordinate = chCoordiante.fromAttr(newValue.northeast);
          var swCoordinate = chCoordiante.fromAttr(newValue.southwest);
          if(!neCoordinate || !swCoordinate) return;

          var realBounds = $scope.map.getBounds();
          if(realBounds.getNorthEast().equals(neCoordinate.$googleCoord())) return;
          if(realBounds.getSouthWest().equals(swCoordinate.$googleCoord())) return;

          settingCenterFromScope = true;
          var googleBound = new google.maps.LatLngBounds(swCoordinate.$googleCoord(), neCoordinate.$googleCoord());
          if($isTrue(attrs.pan) && $scope.zoom == $scope.map.zoom) $scope.map.panToBounds(googleBound);
          else $scope.map.fitBounds(googleBound);
          settingCenterFromScope = false;
        });
      });
      $scope.$watchCollection("options", function(newValue, oldValue){
        if(angular.equals(newValue,oldValue)) return;
        $timeout(function(){
          $scope.map.setOptions(newValue);
        });
      });
    },
  }
}])

})();