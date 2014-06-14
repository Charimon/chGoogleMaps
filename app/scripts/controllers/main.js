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
    }

    $scope.reset = function(){
      var markers = [];
      if($scope.toggled) {
        
        $scope.markers = [{latitude:46.812411, longitude:-118.217283, id:0},
          {latitude:46.752226, longitude:-102.660642, id:1},
          {latitude:43.657083, longitude:-85.346189, id:2}];
      } else {
        $scope.markers = [{latitude:37.524039, longitude:-109.867674, id:0},
          {latitude:41.981075, longitude:-112.504392, id:1},
          {latitude:37.244695, longitude:-87.543455, id:2, icon:{anchor:{x:4,y:4},url:"/images/circle.png"}},];
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
          {id:0, path:[
            {latitude:46.812411, longitude:-118.217283},
            {latitude:46.752226, longitude:-102.660642},
            {latitude:43.657083, longitude:-85.346189},
          ]},
        ];
      } else {
        $scope.polygons = [
          {id:0, path:[
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

  });