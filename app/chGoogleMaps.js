angular.module('chGoogleMap.models', []);
angular.module('chGoogleMap', ['chGoogleMap.models']);
(function() {
"use strict";

angular.module('chGoogleMap.models')
.factory('chCoordiante', ['$timeout', function($timeout){
  function chCoordinate(latitude, longitude){
    this.latitude = null;
    this.longitude = null;
    this.type = 'chCoordiante';
  };

  chCoordinate.fromAttr = function(attribute) {
    if(!attribute) return null;
    if(!attribute.longitude || !attribute.latitude) throw "coordinate must have latitude and longitude values";
    var coordinate = new chCoordinate();
    coordinate.latitude = attribute.latitude;
    coordinate.longitude = attribute.longitude;
    return coordinate;
  };

  chCoordinate.prototype = {
    $googleCoord: function(){return new google.maps.LatLng(this.latitude, this.longitude);},
    toString: function(){return "{" + this.latitude + ", " + this.longitude + "}"},
  };

  return chCoordinate;
}])


})();
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
      bound:'=?',
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
        options:{},
        center:chCoordiante.fromAttr($scope.center).$googleCoord(),
        zoom:$scope.zoom,
        draggable: $isTrue(attrs.draggable),
      };
      if(angular.isString(attrs.type)) {
        opts.mapTypeId = google.maps.MapTypeId[angular.uppercase(attrs.type)];
      }
      $scope.map = new google.maps.Map($element.find('div')[0], angular.extend(DEFAULTS, opts));

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
      // $scope.$watchCollection("bounds", function(newValue, oldValue){
      //   if(angular.equals(newValue,oldValue)) return;
      //   $timeout(function(){
      //     // $scope.map.setZoom(newValue);
      //   });
      // });
      $scope.$watchCollection("options", function(newValue, oldValue){
        if(angular.equals(newValue,oldValue)) return;
        $timeout(function(){
          // $scope.map.setZoom(newValue);
        });
      });
    },
  }
}])

})();
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
(function() {
"use strict";

angular.module('chGoogleMap.models').directive("path",['$timeout', 'chCoordiante', function($timeout, chCoordiante){
  return {
    restrict:'AE',
    scope: {
      coordinates:'=',
      events:'=?',
    },
    require: '^polygon',
    link: function($scope, element, attrs, polygonController){
      $timeout(function(){
        if(angular.isArray($scope.coordinates)) {
          var coordinates = [];
          angular.forEach($scope.coordinates, function(coordinate, i){
            coordinates.push(chCoordiante.fromAttr(coordinate).$googleCoord());
          });
          polygonController.getPolygon().setPath(coordinates);
        }

        var path = polygonController.getPolygon().getPath();
        if(angular.isObject($scope.events) ) {
          angular.forEach($scope.events, function(fn,key){
            if(angular.isFunction(fn)) {
              google.maps.event.addListener(path, key, function(){ $scope.events[key].apply($scope, [polygonController.getPolygon(), key, arguments]);});
            }
          });
        };
      });

      element.on('$destroy', function(s) {
        polygonController.getPolygon().setPath(null);
      });
    },
  }
}])


})();
(function() {
"use strict";

angular.module('chGoogleMap.models').directive("polygon",['$timeout', 'chCoordiante', function($timeout, chCoordiante){
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
        getPolygon: function(){return $scope.polygon;}
      };
      
    }],
    link: function($scope, element, attrs, mapController){
      $scope.polygon = new google.maps.Polygon();
      //$timeout so as to not freeze up the map
      $timeout(function(){
        $scope.polygon.setMap(mapController.getMap());

        if(angular.isObject($scope.events) ) {
          angular.forEach($scope.events, function(fn,key){
            if(angular.isFunction(fn)) {
              google.maps.event.addListener($scope.polygon, key, function(){ $scope.events[key].apply($scope, [$scope.polygon, key, arguments]);});
            }
          });
        };
      });

      element.on('$destroy', function(s) {
        $scope.polygon.setMap(null);
        $scope.polygon = null;
      });


    },
  }
}])

})();