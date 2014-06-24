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