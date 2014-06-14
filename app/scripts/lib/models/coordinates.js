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