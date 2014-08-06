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

function $getPathArc(center, radiusMeters, startAngle, endAngle){
  if(!startAngle || !endAngle) return [];
  var points = Array();
  var angle = startAngle;
  var step = 360/24;
  if(endAngle < 0) endAngle += Math.ceil(-endAngle/360)*360;

  var angle = Math.ceil(startAngle/step)*step;
  if(angle == startAngle) angle += step;


  points.push(center);
  points.push(google.maps.geometry.spherical.computeOffset(center, radiusMeters, startAngle));

  while(true) {
    if(angle >= endAngle) break;
    points.push(google.maps.geometry.spherical.computeOffset(center, radiusMeters, angle));
    angle+=step;
  }
  points.push(google.maps.geometry.spherical.computeOffset(center, radiusMeters, endAngle));

  return points;
}

angular.module('chGoogleMap.models')
.factory('chCone', ['$timeout', 'chCoordiante', function($timeout, chCoordiante){
  function chCone(){};

  chCone.fromAttrs = function(item) {
    var center = chCoordiante.fromAttr(item.center);
    if(!angular.isDefined(center)) throw "cone must have a center key";

    var cone = new chCone();
    cone.center = center;
    cone.radius = item.radius;
    cone.options = item.options;
    cone.start = item.start;
    cone.end = item.end;

    return cone;
  }

  chCone.fromItemAndAttr = function(item, keys) {
    var center = null;
    if(angular.isDefined(keys.center) && keys.center == 'self') center = chCoordiante.fromAttr(item)
    else if(angular.isDefined(keys.center)) center = chCoordiante.fromAttr($getProperty(keys.center, item))
    if(!angular.isDefined(center)) throw "cone in cones must have a center key";    

    var cone = new chCone();
    cone.center = center;

    if(angular.isDefined(keys.radius) && keys.radius == 'self') cone.radius = item;
    else if(angular.isDefined(keys.radius)) cone.radius = $getProperty(keys.radius, item);

    if(angular.isDefined(keys.options) && keys.options == 'self') cone.options = item;
    else if(angular.isDefined(keys.options)) cone.options = $getProperty(keys.options, item);

    if(angular.isDefined(keys.start) && keys.start == 'self') cone.start = item;
    else if(angular.isDefined(keys.start)) cone.start = $getProperty(keys.start, item);

    if(angular.isDefined(keys.end) && keys.end == 'self') cone.end = item;
    else if(angular.isDefined(keys.end)) cone.end = $getProperty(keys.end, item);

    return cone;
  };

  chCone.prototype = {
    $googleCone: function(map, scope, events){
      var cone = new google.maps.Polygon();
      cone.setMap(map);
      cone.setOptions(this.options);

      var path = $getPathArc(this.center.$googleCoord(), this.radius, this.start, this.end);
      cone.setPath(path);

      var _this = this;
      angular.forEach(events, function(fn,key){
        if(angular.isFunction(fn)) {
          google.maps.event.addListener(cone, key, function(){ events[key].apply(scope, [_this, key, arguments]);});
        }
      });

      return cone;
    },
    toString: function(){return this.center;},
  };

  return chCone;
}])


})();