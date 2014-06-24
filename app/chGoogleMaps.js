/**
 * @license
 *
 * Copyright 2011 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Map Label.
 *
 * @author Luke Mahe (lukem@google.com),
 *         Chris Broadfoot (cbro@google.com)
 */

/**
 * Creates a new Map Label
 * @constructor
 * @extends google.maps.OverlayView
 * @param {Object.<string, *>=} opt_options Optional properties to set.
 */
function MapLabel(opt_options) {
  this.set('fontFamily', 'sans-serif');
  this.set('fontSize', 12);
  this.set('fontColor', '#000000');
  this.set('strokeWeight', 4);
  this.set('strokeColor', '#ffffff');
  this.set('align', 'center');

  this.set('zIndex', 1e3);

  this.setValues(opt_options);
}
MapLabel.prototype = new google.maps.OverlayView;

window['MapLabel'] = MapLabel;


/** @inheritDoc */
MapLabel.prototype.changed = function(prop) {
  switch (prop) {
    case 'fontFamily':
    case 'fontSize':
    case 'fontColor':
    case 'strokeWeight':
    case 'strokeColor':
    case 'align':
    case 'text':
      return this.drawCanvas_();
    case 'maxZoom':
    case 'minZoom':
    case 'position':
      return this.draw();
  }
};

/**
 * Draws the label to the canvas 2d context.
 * @private
 */
MapLabel.prototype.drawCanvas_ = function() {
  var canvas = this.canvas_;
  if (!canvas) return;

  var style = canvas.style;
  style.zIndex = /** @type number */(this.get('zIndex'));

  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = this.get('strokeColor');
  ctx.fillStyle = this.get('fontColor');
  ctx.font = this.get('fontSize') + 'px ' + this.get('fontFamily');

  var strokeWeight = Number(this.get('strokeWeight'));

  var text = this.get('text');
  if (text) {
    if (strokeWeight) {
      ctx.lineWidth = strokeWeight;
      ctx.strokeText(text, strokeWeight, strokeWeight);
    }

    ctx.fillText(text, strokeWeight, strokeWeight);

    var textMeasure = ctx.measureText(text);
    var textWidth = textMeasure.width + strokeWeight;
    style.marginLeft = this.getMarginLeft_(textWidth) + 'px';
    // Bring actual text top in line with desired latitude.
    // Cheaper than calculating height of text.
    style.marginTop = '-0.4em';
  }
};

/**
 * @inheritDoc
 */
MapLabel.prototype.onAdd = function() {
  var canvas = this.canvas_ = document.createElement('canvas');
  var style = canvas.style;
  style.position = 'absolute';

  var ctx = canvas.getContext('2d');
  ctx.lineJoin = 'round';
  ctx.textBaseline = 'top';

  this.drawCanvas_();

  var panes = this.getPanes();
  if (panes) {
    panes.mapPane.appendChild(canvas);
  }
};
MapLabel.prototype['onAdd'] = MapLabel.prototype.onAdd;

/**
 * Gets the appropriate margin-left for the canvas.
 * @private
 * @param {number} textWidth  the width of the text, in pixels.
 * @return {number} the margin-left, in pixels.
 */
MapLabel.prototype.getMarginLeft_ = function(textWidth) {
  switch (this.get('align')) {
    case 'left':
      return 0;
    case 'right':
      return -textWidth;
  }
  return textWidth / -2;
};

/**
 * @inheritDoc
 */
MapLabel.prototype.draw = function() {
  var projection = this.getProjection();

  if (!projection) {
    // The map projection is not ready yet so do nothing
    return;
  }

  var latLng = /** @type {google.maps.LatLng} */ (this.get('position'));
  if (!latLng) {
    return;
  }
  var pos = projection.fromLatLngToDivPixel(latLng);

  var style = this.canvas_.style;

  style['top'] = pos.y + 'px';
  style['left'] = pos.x + 'px';

  style['visibility'] = this.getVisible_();
};
MapLabel.prototype['draw'] = MapLabel.prototype.draw;

/**
 * Get the visibility of the label.
 * @private
 * @return {string} blank string if visible, 'hidden' if invisible.
 */
MapLabel.prototype.getVisible_ = function() {
  var minZoom = /** @type number */(this.get('minZoom'));
  var maxZoom = /** @type number */(this.get('maxZoom'));

  if (minZoom === undefined && maxZoom === undefined) {
    return '';
  }

  var map = this.getMap();
  if (!map) {
    return '';
  }

  var mapZoom = map.getZoom();
  if (mapZoom < minZoom || mapZoom > maxZoom) {
    return 'hidden';
  }
  return '';
};

/**
 * @inheritDoc
 */
MapLabel.prototype.onRemove = function() {
  var canvas = this.canvas_;
  if (canvas && canvas.parentNode) {
    canvas.parentNode.removeChild(canvas);
  }
};
MapLabel.prototype['onRemove'] = MapLabel.prototype.onRemove;
angular.module('chGoogleMap.models', []);
angular.module('chGoogleMap', ['chGoogleMap.models']);
(function() {
"use strict";

function $getProperty( propertyName, object ) {
  var parts = propertyName.split( "." );
  var length = parts.length;
  var i;
  var property = object || this;
 
  for ( i = 0; i < length; i++ ) {
    property = property[parts[i]];
  }
 
  return property;
}

angular.module('chGoogleMap.models')
.factory('chCircle', ['$timeout', 'chCoordiante', function($timeout, chCoordiante){
  function chCircle(){};

  chCircle.fromAttrs = function(item) {
    var center = chCoordiante.fromAttr(item.center);
    if(!angular.isDefined(center)) throw "circle must have a center key";

    var circle = new chCircle();
    circle.center = center;
    circle.radius = item.radius;
    circle.options = item.options;

    return circle;
  }

  chCircle.fromItemAndAttr = function(item, keys) {
    var center = null;
    if(angular.isDefined(keys.center) && keys.center == 'self') center = chCoordiante.fromAttr(item)
    else if(angular.isDefined(keys.center)) center = chCoordiante.fromAttr($getProperty(keys.center, item))
    if(!angular.isDefined(center)) throw "circle in circles must have a center key";    

    var circle = new chCircle();
    circle.center = center;

    if(angular.isDefined(keys.radius) && keys.radius == 'self') circle.radius = item;
    else if(angular.isDefined(keys.radius)) circle.radius = $getProperty(keys.radius, item);

    if(angular.isDefined(keys.options) && keys.options == 'self') circle.options = item;
    else if(angular.isDefined(keys.options)) circle.options = $getProperty(keys.options, item);

    return circle;
  };

  chCircle.prototype = {
    $googleCircle: function(map, scope, events){
      var circle = new google.maps.Circle();
      circle.setMap(map);
      circle.setOptions(this.options);
      circle.setCenter(this.center.$googleCoord());
      circle.setRadius(this.radius);

      var _this = this;
      angular.forEach(events, function(fn,key){
        if(angular.isFunction(fn)) {
          google.maps.event.addListener(circle, key, function(){ events[key].apply(scope, [_this, key, arguments]);});
        }
      });

      return circle;
    },
    toString: function(){return this.center;},
  };

  return chCircle;
}])


})();
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

function $getProperty( propertyName, object ) {
  var parts = propertyName.split( "." );
  var length = parts.length;
  var i;
  var property = object || this;
 
  for ( i = 0; i < length; i++ ) {
    property = property[parts[i]];
  }
 
  return property;
}

angular.module('chGoogleMap.models')
.factory('chLabel', ['$timeout', 'chCoordiante', function($timeout, chCoordiante){
  function chLabel(){};

  chLabel.fromAttrs = function(item) {
    var position = chCoordiante.fromAttr(item.position);
    if(!angular.isDefined(position)) throw "label must have a position key";

    var label = new chLabel();
    label.position = position;
    label.text = item.labelText;

    return label;
  }

  chLabel.fromItemAndAttr = function(item, keys) {
    var position = null;
    if(angular.isDefined(keys.position) && keys.position == 'self') position = chCoordiante.fromAttr(item)
    else if(angular.isDefined(keys.position)) position = chCoordiante.fromAttr($getProperty(keys.position, item))
    if(!angular.isDefined(position)) throw "label in markers must have a position key";    

    var label = new chLabel();
    label.position = position;

    if(angular.isDefined(keys.labelText) && keys.labelText == 'self') label.text = item;
    else if(angular.isDefined(keys.labelText)) label.text = $getProperty(keys.labelText, item);

    return label;
  };

  chLabel.prototype = {
    $googleLabel: function(map, scope, events){
      if(this.text) {
        var label = new MapLabel();
        label.set('text', this.text);
        label.set('fontSize', 14);
        label.set('align', 'left');
        label.set('position', this.position.$googleCoord());
        label.set('map', map);

        return label;  
      } else {
        return null;
      }
      
    },
    toString: function(){return this.position;},
  };

  return chLabel;
}])


})();
(function() {
"use strict";

function $getProperty( propertyName, object ) {
  var parts = propertyName.split( "." );
  var length = parts.length;
  var i;
  var property = object || this;
 
  for ( i = 0; i < length; i++ ) {
    property = property[parts[i]];
  }
 
  return property;
}

angular.module('chGoogleMap.models')
.factory('chMarker', ['$timeout', 'chCoordiante', 'chLabel', function($timeout, chCoordiante, chLabel){
  function chMarker(){};

  chMarker.fromAttrs = function(item) {
    var position = chCoordiante.fromAttr(item.position);
    if(!angular.isDefined(position)) throw "marker must have a position key";

    var marker = new chMarker();
    marker.position = position;
    marker.icon = item.icon;
    marker.label = chLabel.fromAttrs(item);
    marker.options = item.options;

    return marker;
  }

  chMarker.fromItemAndAttr = function(item, keys) {
    var position = null;
    if(angular.isDefined(keys.position) && keys.position == 'self') position = chCoordiante.fromAttr(item)
    else if(angular.isDefined(keys.position)) position = chCoordiante.fromAttr($getProperty(keys.position, item))
    if(!angular.isDefined(position)) throw "marker in markers must have a position key";    

    var marker = new chMarker();
    marker.position = position;

    if(angular.isDefined(keys.icon) && keys.icon == 'self') marker.icon = item;
    else if(angular.isDefined(keys.icon)) marker.icon = $getProperty(keys.icon, item);

    if(angular.isDefined(keys.labelContent) && keys.labelContent == 'self') marker.labelContent = item;
    else if(angular.isDefined(keys.labelContent)) marker.labelContent = $getProperty(keys.labelContent, item);

    if(angular.isDefined(keys.options) && keys.options == 'self') marker.options = item;
    else if(angular.isDefined(keys.options)) marker.options = $getProperty(keys.options, item);

    marker.label = chLabel.fromItemAndAttr(item, keys);

    return marker;
  };
  chMarker.updateGoogleMapMarker = function(googleMapMarker, item, keys) {
    if(angular.isDefined(keys.position) && keys.position == 'self') googleMapMarker.setPosition(chCoordiante.fromAttr(item).$googleCoord());
    else if(angular.isDefined(keys.position)) googleMapMarker.setPosition(chCoordiante.fromAttr($getProperty(keys.position, item)).$googleCoord());

    if(angular.isDefined(keys.icon) && keys.icon == 'self') googleMapMarker.setIcon(item);
    else if(angular.isDefined(keys.icon)) googleMapMarker.setIcon($getProperty(keys.icon, item));

    if(angular.isDefined(keys.options) && keys.options == 'self') googleMapMarker.setOptions(item);
    else if(angular.isDefined(keys.options)) googleMapMarker.setOptions($getProperty(keys.options, item));

    return googleMapMarker;
  }

  chMarker.prototype = {
    $googleMarker: function(map, scope, events){
      var marker = new google.maps.Marker();
      marker.setMap(map);
      marker.setOptions(this.options);
      marker.setPosition(this.position.$googleCoord());
      marker.setIcon(this.icon);
      marker.$label = this.label.$googleLabel(map, scope, events);

      var _this = this;
      angular.forEach(events, function(fn,key){
        if(angular.isFunction(fn)) {
          google.maps.event.addListener(marker, key, function(){ events[key].apply(scope, [_this, key, arguments]);});
        }
      });

      return marker;
    },
    toString: function(){return this.position;},
  };

  return chMarker;
}])


})();
(function() {
"use strict";

function $getProperty( propertyName, object ) {
  var parts = propertyName.split( "." );
  var length = parts.length;
  var i;
  var property = object || this;
 
  for ( i = 0; i < length; i++ ) {
    property = property[parts[i]];
  }
 
  return property;
}

angular.module('chGoogleMap.models')
.factory('chPolygon', ['$timeout', 'chCoordiante', function($timeout, chCoordiante){
  function chPolygon(){};

  chPolygon.fromAttrs = function(item) {
    var polygon = new chPolygon();
    polygon.options = item.options;
    return polygon;
  }

  chPolygon.fromItemAndAttr = function(item, keys) {
    var polygon = new chPolygon();

    if(angular.isDefined(keys.options) && keys.options == 'self') polygon.options = item;
    else if(angular.isDefined(keys.options)) polygon.options = $getProperty(keys.options, item);

    if(angular.isDefined(keys.path)) {
      polygon.path = [];
      angular.forEach($getProperty(keys.path, item), function(item, i){
        polygon.path.push(chCoordiante.fromAttr(item).$googleCoord());
      });
    } 

    return polygon;
  };

  chPolygon.prototype = {
    $googlePolygon: function(map, scope, events){
      var polygon = new google.maps.Polygon();
      polygon.setMap(map);
      polygon.setOptions(this.options);

      if(this.path) polygon.setPath(this.path);

      var _this = this;
      angular.forEach(events, function(fn,key){
        if(angular.isFunction(fn)) {
          google.maps.event.addListener(polygon, key, function(){ events[key].apply(scope, [_this, key, arguments]);});
        }
      });

      return polygon;
    },
    toString: function(){return this.position;},
  };

  return chPolygon;
}])


})();
(function() {
"use strict";

function $getProperty( propertyName, object ) {
  var parts = propertyName.split( "." );
  var length = parts.length;
  var i;
  var property = object || this;
 
  for ( i = 0; i < length; i++ ) {
    property = property[parts[i]];
  }
 
  return property;
}

angular.module('chGoogleMap.models')
.factory('chPolyline', ['$timeout', 'chCoordiante', function($timeout, chCoordiante){
  function chPolyline(){};

  chPolyline.fromAttrs = function(item) {
    var polyline = new chPolyline();
    polyline.options = item.options;
    return polyline;
  }

  chPolyline.fromItemAndAttr = function(item, keys) {
    var polyline = new chPolyline();

    if(angular.isDefined(keys.options) && keys.options == 'self') polyline.options = item;
    else if(angular.isDefined(keys.options)) polyline.options = $getProperty(keys.options, item);

    if(angular.isDefined(keys.path)) {
      polyline.path = [];
      angular.forEach($getProperty(keys.path, item), function(item, i){
        polyline.path.push(chCoordiante.fromAttr(item).$googleCoord());
      });
    } 

    return polyline;
  };

  chPolyline.prototype = {
    $googlePolyline: function(map, scope, events){
      var polyline = new google.maps.Polyline();
      polyline.setMap(map);
      polyline.setOptions(this.options);

      if(this.path) polyline.setPath(this.path);

      var _this = this;
      angular.forEach(events, function(fn,key){
        if(angular.isFunction(fn)) {
          google.maps.event.addListener(polyline, key, function(){ events[key].apply(scope, [_this, key, arguments]);});
        }
      });

      return polyline;
    },
    toString: function(){return this.position;},
  };

  return chPolyline;
}])


})();
(function() {
"use strict";

angular.module('chGoogleMap.models').directive("circle",['$timeout', 'chCoordiante', 'chCircle', function($timeout, chCoordiante, chCircle){
  return {
    restrict:'AE',
    scope: {
      center:'=',
      radius:'=',
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
      $scope.circle = chCircle.fromAttrs($scope).$googleCircle(mapController.getMap(), $scope, $scope.events);

      element.on('$destroy', function(s) {
        $scope.circle.setMap(null);
        $scope.circle = null;
      });

      $scope.$watch("center", function(newValue, oldValue){
        if(!angular.isDefined(newValue)) return;
        
        $timeout(function(){
          var newCoord = chCoordiante.fromAttr(newValue).$googleCoord();
          if($scope.circle) $scope.circle.setCenter(newCoord);
        });
      });

      $scope.$watch("radius", function(newValue, oldValue){
        if(!angular.isDefined(newValue)) return;
        
        $timeout(function(){
          if($scope.circle) $scope.circle.setRadius(newValue);
        });
      });

      $scope.$watchCollection("options", function(newValue, oldValue){
        if(angular.equals(newValue,oldValue)) return;
        $timeout(function(){
          $scope.circle.setOptions(newValue);
        });
      });

    },
  }
}])

})();
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
        $timeout(function(){
          if(dragging) $scope.dragging = dragging;
        });
      });
      google.maps.event.addListener($scope.map, "dragend", function(){
        dragging = false;
        $timeout(function(){
          if(!dragging) $scope.dragging = dragging;
        });
      });

      //this causes weird jumps when you drag the map, not sure how to fix it
      // google.maps.event.addListener($scope.map, "drag", function(){
      //   $timeout(function(){
      //     var center = $scope.map.center;
      //     if(angular.isDefined($scope.center) && angular.isDefined($scope.center.latitude) && angular.isDefined($scope.center.longitude)) {
      //       $scope.center.latitude = center.lat();
      //       $scope.center.longitude = center.lng();
      //     };
      //   });
      // });

      google.maps.event.addListener($scope.map, "zoom_changed", function(){
        $timeout.cancel($scope.zoomChangedPromise);
        $scope.zoomChangedPromise = $timeout(function(){
          // console.log('zoom_changed ' + $scope.map.zoom);
          $scope.zoom = $scope.map.zoom;
        });
      });
      
      var settingCenterFromScope = false;
      google.maps.event.addListener($scope.map, "center_changed", function(){
        if(settingCenterFromScope) return;
        
        $timeout.cancel($scope.centerChangedPromise);
        $scope.centerChangedPromise = $timeout(function(){
          // console.log('center_changed <' + $scope.map.center.lat() + ", " + $scope.map.center.lat() + ">");
          var center = $scope.map.center;
          if(angular.isDefined($scope.center) && angular.isDefined($scope.center.latitude) && angular.isDefined($scope.center.longitude)) {
            if($scope.center.latitude != center.lat()) $scope.center.latitude = center.lat();
            if($scope.center.longitude != center.lng()) $scope.center.longitude = center.lng();
          }
        }, 400);

      });
      google.maps.event.addListener($scope.map, "idle", function(){
        $timeout.cancel($scope.idlePromise);
        $scope.idlePromise = $timeout(function(){
          // console.log('idling');
          if(angular.isDefined($scope.bounds)) {
            var bounds = $scope.map.getBounds();
            var ne = bounds.getNorthEast();
            var sw = bounds.getSouthWest();
            $scope.bounds.northeast = {latitude: ne.lat(), longitude: ne.lng()};
            $scope.bounds.southwest = {latitude: sw.lat(), longitude: sw.lng()};
          }
        });
      });

      //add map events
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
        
        $timeout.cancel($scope.centerWatchPromise);
        $scope.centerWatchPromise = $timeout(function(){
          var newCoordinate = chCoordiante.fromAttr(newValue);
          if(newCoordinate.$googleCoord().equals($scope.map.center)) return;

          // console.log('watching center ' + newCoordinate + " from: <" + $scope.map.center.lat() + ", " + $scope.map.center.lat() + ">");
          settingCenterFromScope = true;
          if($isTrue(attrs.pan) && $scope.zoom == $scope.map.zoom) $scope.map.panTo(newCoordinate.$googleCoord());
          else $scope.map.setCenter(newCoordinate.$googleCoord());
          settingCenterFromScope = false;
        });
      });
      $scope.$watch("zoom", function(newValue, oldValue){
        if(!angular.isDefined(newValue)) return;
        
        $timeout.cancel($scope.zoomWatchPromise);
        $scope.zoomWatchPromise = $timeout(function(){
          if(!angular.equals(newValue, $scope.map.zoom)) {
            // console.log('watching zoom ' + newValue + " from: " + oldValue);
            $scope.map.setZoom(newValue);
          }
        });
      });
      $scope.$watchCollection("bounds", function(newValue, oldValue){
        if(!angular.isDefined(newValue) || dragging || !angular.isDefined(newValue.northeast) || !angular.isDefined(newValue.southwest)) return;
        
        $timeout.cancel($scope.boundsWatchPromise);
        $scope.boundsWatchPromise = $timeout(function(){
          var neCoordinate = chCoordiante.fromAttr(newValue.northeast);
          var swCoordinate = chCoordiante.fromAttr(newValue.southwest);
          if(!neCoordinate || !swCoordinate) return;

          var realBounds = $scope.map.getBounds();
          if(realBounds.getNorthEast().equals(neCoordinate.$googleCoord())) return;
          if(realBounds.getSouthWest().equals(swCoordinate.$googleCoord())) return;

          settingCenterFromScope = true;
          // console.log('watching bounds');
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
(function() {
"use strict";

//use this if you have under 400 markers, 1000 is pushing it, 10,000 becomes unresponsive
angular.module('chGoogleMap.models').directive("marker",['$timeout', 'chCoordiante', 'chMarker', function($timeout, chCoordiante, chMarker){
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
      $scope.marker = chMarker.fromAttrs($scope).$googleMarker(mapController.getMap(), $scope, $scope.events);

      element.on('$destroy', function(s) {
        if($scope.marer.$label) $scope.marer.$label.set('map', null);
        $scope.marker.setMap(null);
        $scope.marker = null;
      });

      if($scope.$watchGroup) {
        $scope.$watchGroup(["position", "icon"], function(newValue, oldValue){
          $timeout(function(){
            if(!$scope.marker) return;

            if(angular.isDefined(newValue[0])){
              var newCoord = chCoordiante.fromAttr(newValue[0]).$googleCoord();
              $scope.marker.setPosition(newCoord);
            }
            $scope.marker.setIcon(newValue[1]);
          });
        });
      } else {
        $scope.$watch("icon", function(newValue, oldValue){
          $timeout(function(){
            if(!$scope.marker) return;
            $scope.marker.setIcon(newValue);
          });
        });

        $scope.$watch("position", function(newValue, oldValue){
          $timeout(function(){
            if(!$scope.marker) return;
            
            if(angular.isDefined(newValue)){
              var newCoord = chCoordiante.fromAttr(newValue).$googleCoord();
              $scope.marker.setPosition(newCoord);
            }
          });
        });
      }
      

      $scope.$watchCollection("options", function(newValue, oldValue){
        if(angular.equals(newValue,oldValue)) return;
        $timeout(function(){
          $scope.marker.setOptions(newValue);
        });
      });

    },
  }
}])

})();
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
(function() {
"use strict";

angular.module('chGoogleMap.models').directive("path",['$timeout', 'chCoordiante', function($timeout, chCoordiante){
  return {
    restrict:'E',
    scope: {
      coordinates:'=',
      events:'=?',
    },
    require: ['?^polygon', '?^polyline'],
    link: function($scope, element, attrs, controllers){
      $timeout(function(){
        if(angular.isArray($scope.coordinates)) {
          var coordinates = [];
          angular.forEach($scope.coordinates, function(coordinate, i){
            coordinates.push(chCoordiante.fromAttr(coordinate).$googleCoord());
          });
          if(angular.isDefined(controllers[0])) controllers[0].getPolygon().setPath(coordinates);
          else if(angular.isDefined(controllers[1])) controllers[1].getPolyline().setPath(coordinates);
        }

        var path;
        if(angular.isDefined(controllers[0])) path = controllers[0].getPolygon().getPath();
        else if(angular.isDefined(controllers[1])) path = controllers[1].getPolyline().getPath();
        if(angular.isObject($scope.events) && path) {
          angular.forEach($scope.events, function(fn,key){
            if(angular.isFunction(fn)) {
              var objectToSend = null;
              if(angular.isDefined(controllers[0])) objectToSend = controllers[0].getPolygon();
              else if(angular.isDefined(controllers[1])) objectToSend = controllers[1].getPolyline();
              google.maps.event.addListener(path, key, function(){ $scope.events[key].apply($scope, [objectToSend, key, arguments]);});
            }
          });
        };
      });

      element.on('$destroy', function(s) {
        var obj = null;
        if(angular.isDefined(controllers[0])) obj = controllers[0].getPolygon();
        else if(angular.isDefined(controllers[1])) obj = controllers[1].getPolyline();
        if(obj) obj.setPath(null);
      });
    },
  }
}])


})();
(function() {
"use strict";

var $isTrue =  function(value){ return ['true', 'TRUE', 1, 'y', 'Y', 'yes', 'YES'].indexOf(value) !== -1;}

angular.module('chGoogleMap.models').directive("polygon",['$timeout', 'chPolygon', function($timeout, chPolygon){
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
      var a = chPolygon.fromAttrs($scope);
      $scope.polygon = a.$googlePolygon(mapController.getMap(), $scope, $scope.events);

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