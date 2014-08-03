'use strict';

/**
 * @ngdoc function
 * @name chGoogleMapsApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the chGoogleMapsApp
 */
angular.module('chGoogleMapsApp')
  .controller('MainCtrl', function ($scope) {
    $scope.markers = [];

    $scope.polygons = [];

    $scope.map = {
      zoom:4,
      center:{
        latitude:37.68,
        longitude:-97.33,
      },
      bounds:{
        northeast:null,
        southwest:null,
      },
      events: {
        idle: function() {
        },
      },
      markerEvents: {
        click: function(){
          alert('marker clicked');
        }
      },
    };

    $scope.resetCenter = function(){
      $scope.map.center.latitude = 37.68;
      $scope.map.center.longitude = -97.33;
    };

    $scope.resetBounds = function(){
      $scope.map.bounds.northeast = {
        latitude:54.467232292,
        longitude:-31.807539062,
      };
      $scope.map.bounds.southwest = {
        latitude:33.280584554,
        longitude:-107.349531,
      };
    };

    $scope.reset = function(){
      if($scope.toggled) {
        var markers = [];
        for(var i=0; i<10; i++) {
          var lat = Math.random() * 180 - 90
          var lng = Math.random() * 360 - 180
          markers.push({latitude:lat, longitude:lng, id:i, name:"name"+i});
        }
        $scope.markers = markers;
      } else {
        var markers = [];
        for(var i=0; i<10; i++) {
          var lat = Math.random() * 180 - 90
          var lng = Math.random() * 360 - 180
          markers.push({latitude:lat, longitude:lng, id:i, name:"name"+i, icon:{ anchor:{x:4,y:4},url:"/images/circle.png"}});
        }
        $scope.markers = markers;
      }
      $scope.toggled = !$scope.toggled;
    }

    $scope.resetHard = function(){
      var markers = [];
      if($scope.toggled) {
        
        $scope.markers = [{latitude:46.812411, longitude:-118.217283, id:10},
          {latitude:46.752226, longitude:-102.660642, id:11},
          {latitude:43.657083, longitude:-85.346189, id:12}];
      } else {
        $scope.markers = [{latitude:37.524039, longitude:-109.867674, id:10},
          {latitude:41.981075, longitude:-112.504392, id:11},
          {latitude:37.244695, longitude:-87.543455, id:12},];
      }
      $scope.toggled = !$scope.toggled;
    }

    $scope.resetPolygons = function(){
      var polygons = [];
      if($scope.polygonsToggled) {
        
        $scope.polygons = [
          {id:0, options:{fillColor:'#0055ff',strokeWeight:1},
            path:[
            {latitude:46.812411, longitude:-118.217283},
            {latitude:46.752226, longitude:-102.660642},
            {latitude:43.657083, longitude:-85.346189},
          ]},
        ];
      } else {
        $scope.polygons = [
          {id:0, options:{fillColor:'#0055ff',strokeWeight:1},
            path:[
            {latitude:37.524039, longitude:-109.867674},
            {latitude:41.981075, longitude:-112.504392},
            {latitude:37.244695, longitude:-87.543455},
          ]},
        ];
      }
      $scope.polygonsToggled = !$scope.polygonsToggled;
    }

    $scope.resetPolygonsHard = function(){
      var polygons = [];
      if($scope.polygonsToggled) {
        
        $scope.polygons = [
          {id:10, path:[
            {latitude:46.812411, longitude:-118.217283},
            {latitude:46.752226, longitude:-102.660642},
            {latitude:43.657083, longitude:-85.346189},
          ]},
        ];
      } else {
        $scope.polygons = [
          {id:10, path:[
            {latitude:37.524039, longitude:-109.867674},
            {latitude:41.981075, longitude:-112.504392},
            {latitude:37.244695, longitude:-87.543455},
          ]},
        ];
      }
      $scope.polygonsToggled = !$scope.polygonsToggled;
    }

    $scope.resetCircles = function(){
      if($scope.circlesToggled) {
        $scope.circles = [
          {id:1, center:{latitude:46.812411, longitude:-118.217283}, radius:100000},
          {id:2, center:{latitude:46.752226, longitude:-102.660642}, radius:100000},
          {id:3, center:{latitude:43.657083, longitude:-85.346189}, radius:100000},
        ];
      } else {
        $scope.circles = [
          {id:11, center:{latitude:37.524039, longitude:-109.867674}, radius:100000},
          {id:12, center:{latitude:41.981075, longitude:-112.504392}, radius:100000},
          {id:13, center:{latitude:37.244695, longitude:-87.543455}, radius:100000},
        ];
      }
      $scope.circlesToggled = !$scope.circlesToggled;
    }

  });
