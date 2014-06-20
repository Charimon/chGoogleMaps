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