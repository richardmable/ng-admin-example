var myApp = angular.module('myApp', ['ng-admin']);

myApp.config(['NgAdminConfigurationProvider', function(NgAdminConfigurationProvider) {
    var nga = NgAdminConfigurationProvider;
    // create an admin application
    var admin = nga.application('My First Admin');
    // more configuation here later
    // ...
    // attach the admin application to the DOM and run it
    nga.configure(admin);
}]);