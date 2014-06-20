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