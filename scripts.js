var myApp = angular.module('myApp', ['ng-admin']);

myApp.config(['NgAdminConfigurationProvider', function(NgAdminConfigurationProvider) {
    var nga = NgAdminConfigurationProvider;
    // create an admin application
    var admin = nga.application('My First Admin')
    .baseApiUrl('http://jsonplaceholder.typicode.com/'); // main API endpoint

    // create a user entity
    // the API endpoint for this entity will be 'http://jsonplaceholder.typicode.com/users/:id'
    var user = nga.entity('users');
    // set the fields of the user entity list view
    user.listView().fields([
    	nga.field('name'),
    	nga.field('email'),
    	nga.field('username')
    	]);
    // add user entity to the admin application
    admin.addEntity(user);
    // create a post entity
    var post = nga.entity('posts');
    //set the filed of the post entity list view
    post.listView().fields([
    	nga.field('id'),
    	nga.field('title'),
    	// here we user reference to type to refer to another entity
    	// this allows us to display the username instead of the user id
    	nga.field('userId', 'reference')
    		.targetEntity(user)
    		.targetField(nga.field('username'))
    		.label('User')
    	]);
	post.showView().fields([
	    nga.field('title'),
	    nga.field('body', 'text'),
	    nga.field('userId', 'reference')
	        .targetEntity(user)
	        .targetField(nga.field('username'))
	        .label('User'),
	    nga.field('comments', 'referenced_list')
	        .targetEntity(nga.entity('comments'))
	        .targetReferenceField('postId')
	        .targetFields([
	            nga.field('email'),
	            nga.field('name')
	        ])
	        .sortField('id')
	        .sortDir('DESC'),
	]);
    admin.addEntity(post);
    // attach the admin application to the DOM and run it
    nga.configure(admin);
}]);
// map the JSONPlaceholder REST flavor with ng-admin REST flavor
myApp.config(['RestangularProvider', function (RestangularProvider) {
    RestangularProvider.addFullRequestInterceptor(function(element, operation, what, url, headers, params) {
        if (operation == "getList") {
            // custom pagination params
            if (params._page) {
                params._start = (params._page - 1) * params._perPage;
                params._end = params._page * params._perPage;
            }
            delete params._page;
            delete params._perPage;
            // custom sort params
            if (params._sortField) {
                params._sort = params._sortField;
                params._order = params._sortDir;
                delete params._sortField;
                delete params._sortDir;
            }
            // custom filters
            if (params._filters) {
                for (var filter in params._filters) {
                    params[filter] = params._filters[filter];
                }
                delete params._filters;
            }
        }
        return { params: params };
    });
}]);