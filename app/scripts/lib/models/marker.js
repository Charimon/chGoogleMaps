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
.factory('chMarker', ['$timeout', 'chCoordiante', function($timeout, chCoordiante){
  function chMarker(){};

  chMarker.fromAttrs = function(item) {
    var position = chCoordiante.fromAttr(item.position);
    if(!angular.isDefined(position)) throw "marker must have a position key";

    var marker = new chMarker();
    marker.position = position;
    marker.icon = item.icon;
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

    if(angular.isDefined(keys.options) && keys.options == 'self') marker.options = item;
    else if(angular.isDefined(keys.options)) marker.options = $getProperty(keys.options, item);

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