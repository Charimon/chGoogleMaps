(function() {
"use strict";

angular.module('chGoogleMap.models')
.factory('chProjection', ['$timeout', function($timeout){
  function chProjection(x, y){
    this.x = null;
    this.y = null;
  };

  chProjection.fromGoogleProjection = function(gProjection) {
    var projection = new chProjection();
    projection.x = gProjection.x;
    projection.y = gProjection.y;
    return projection;
  };

  chProjection.prototype = {
    toString: function(){return "{" + this.x + ", " + this.y + "}"},
  };

  return chProjection;
}])


})();