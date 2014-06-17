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