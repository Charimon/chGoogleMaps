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
.factory('chPolygon', ['$timeout', 'chCoordiante', 'chProjection', function($timeout, chCoordiante, chProjection){
  function chPolygon(){};

  chPolygon.fromAttrs = function(item) {
    var polygon = new chPolygon();
    polygon.options = item.options;
    polygon.rightClickDelete = item.rightClickDelete;
    return polygon;
  }

  chPolygon.fromItemAndAttr = function(item, keys) {
    var polygon = new chPolygon();

    if(angular.isDefined(keys.options) && keys.options == 'self') polygon.options = item;
    else if(angular.isDefined(keys.options)) polygon.options = $getProperty(keys.options, item);

    if(angular.isDefined(keys.rightClickDelete) && keys.rightClickDelete == 'self') polygon.rightClickDelete = item;
    else if(angular.isDefined(keys.rightClickDelete)) polygon.rightClickDelete = $getProperty(keys.rightClickDelete, item);


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

      if(this.rightClickDelete) {
        google.maps.event.addListener(polygon, 'rightclick', function(e){
          if(e.vertex && polygon.getPath().length > 2) $timeout(function(){polygon.getPath().removeAt(e.vertex);});
        });
      }

      return polygon;
    },
    $projectionPath: function(map, googlePolygon) {
      var gPath = googlePolygon.getPath();
      var pathLength = gPath.getLength();
      var mapProjection = map.getProjection();
      var projections = [];
      for(var i=0; i< pathLength; i++) {
        var projection = mapProjection.fromLatLngToPoint(gPath.getAt(i));
        projections.push(chProjection.fromGoogleProjection(projection));
      }
      return projections;
    },
    toString: function(){return this.position;},
  };

  return chPolygon;
}])


})();