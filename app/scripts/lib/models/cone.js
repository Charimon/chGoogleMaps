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

var EarthRadiusMeters = 6378137.0;

google.maps.LatLng.prototype.DestinationPoint = function (brng, dist) {
  var R = EarthRadiusMeters; // earth's mean radius in meters
  var brng = brng.toRad();
  var lat1 = this.lat().toRad(), lon1 = this.lng().toRad();
  var lat2 = Math.asin( Math.sin(lat1)*Math.cos(dist/R) + 
                        Math.cos(lat1)*Math.sin(dist/R)*Math.cos(brng) );
  var lon2 = lon1 + Math.atan2(Math.sin(brng)*Math.sin(dist/R)*Math.cos(lat1), 
                               Math.cos(dist/R)-Math.sin(lat1)*Math.sin(lat2));

  return new google.maps.LatLng(lat2.toDeg(), lon2.toDeg());
}


function $getPathArc(center, initialBearing, finalBearing, radius) {
  var d2r = Math.PI / 180;   // degrees to radians 
  var r2d = 180 / Math.PI;   // radians to degrees
  var points = 32; 

  // find the raidus in lat/lon 
  var rlat = (radius / EarthRadiusMeters) * r2d; 
  var rlng = rlat / Math.cos(center.lat() * d2r); 

  var extp = new Array();
  if (initialBearing > finalBearing) finalBearing += 360;
  
  var deltaBearing = finalBearing - initialBearing;
  deltaBearing = deltaBearing/points;
  for (var i=0; (i < points+1); i++)  { 
    extp.push(center.DestinationPoint(initialBearing + i*deltaBearing, radius)); 
    bounds.extend(extp[extp.length-1]);
  } 
  return extp;
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

    return cone;
  };

  chCone.prototype = {
    $googleCone: function(map, scope, events){
      var cone = new google.maps.Polygon();
      cone.setMap(map);
      cone.setOptions(this.options);

      var path = getPathArc(this.center.$googleCoord(), 0, 100, 1000);
      // cone.setCenter(this.center.$googleCoord());
      // cone.setRadius(this.radius);

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