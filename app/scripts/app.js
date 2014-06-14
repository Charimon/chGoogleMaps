'use strict';

/**
 * @ngdoc overview
 * @name chGoogleMapsApp
 * @description
 * # chGoogleMapsApp
 *
 * Main module of the application.
 */
angular
  .module('chGoogleMapsApp', [
    'ngResource',
    'ngRoute',
    'chGoogleMap'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
