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
    	// use the name as the link to the detail view - the edition view
    	nga.field('name').isDetailLink(true),
    	nga.field('email'),
    	nga.field('username')
    	]);
    // user creation fields
    user.creationView().fields([
    	nga.field('name')
    		// custom validation rules using the validation() method
    		.validation({ required: true, minlength: 3, maxlength: 100 }),
	    nga.field('username')
	    	// set a message in the box for the user
	    	.attributes({ placeholder: 'No spaces allowed, 5 chars min' })
	    	// make sure it matches a regex pattern of letters and digits between 5-20 chars
	    	.validation({ required: true, pattern: '[A-Za-z0-9\.\-_]{5,20}' }),
	    nga.field('email', 'email')
	    	.validation({ required: true }),
	    nga.field('address.street')
	    	.label('Street'),
	    nga.field('address.city')
	    	.label('City'),
	    nga.field('address.zipcode')
	    	.label('Zipcode')
	    	// validate the zipcode
	    	.validation({ pattern: '[A-Z\-0-9]{5,10}' }),
	    nga.field('phone'),
	    nga.field('website')
	    	// validate the website url format
	    	.validation({ validator: function(value) {
            	if (value.indexOf('http://') !== 0) throw new Error ('Invalid url in website');
        	} })
    	]);
    // use the same fields for the editionView as for the creationView
    // this keeps the code DRY and ensures that you can edit the same fields
    // that you can create
    user.editionView().fields(user.creationView().fields());
    // add user entity to the admin application
    admin.addEntity(user);
    // create a post entity
    var post = nga.entity('posts');
    // sets the posts to be read only
    post.readOnly();
    //set the filed of the post entity list view
    post.listView().fields([
    	nga.field('title').isDetailLink(true),
    	nga.field('body', 'text')
    		// truncate the post to 50 chars in the list view 
            .map(function truncate(value) {
                if (!value) return '';
                return value.length > 50 ? value.substr(0, 50) + '...' : value;
            }),
    	// here we user reference to type to refer to another entity
    	// this allows us to display the username instead of the user id
    	nga.field('userId', 'reference')
    		.targetEntity(user)
    		.targetField(nga.field('username'))
    		.label('Author')
    	// the filters() method allows us to search the list
    	// filters() expects an array of field defintions
    	])
    	// adds a show button on every line to access the show post view
    	// need this since we removed the id from the list
    	.listActions(['show'])
    	// remove batch actions (the checkbox) since this is a ready-only list
    	.batchActions([])
    	.filters([
    		// 'q' is defined as the string field type
    		nga.field('q')
    		.label('')
    		// always display by setting pinned to true
    		.pinned('true')
    		// use Angular directives and the template() field method to display a magnifying glass
    		.template('<div class="input-group"><input type="text" ng-model="value" placeholder="Search" class="form-control"></input><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span></div>'),
    		// userId is a reference to the user entity
    		// this allows adding a filter on the results of a user
    		nga.field('userId', 'reference')
    			.targetEntity(user)
    			.targetField(nga.field('username'))
    			.label('User')
    	])
    // here we show the posts with comments (read-only)
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
    // customize the menu, this creates a menu object
    // a menu object represents a menu item and it can have submenus
    // Calling ng.menu() with an entity parameter sets the menu name, link, and active function automatically
    // admin.menu(), which configures the application menu, expects a root menu object as parameter, and displays the children of this root menu in the sidebar
    admin.menu(nga.menu()
    	.addChild(nga.menu(user).icon('<span class="glyphicon glyphicon-user"></span>'))
    	.addChild(nga.menu(post).icon('<span class="glyphicon glyphicon-pencil"></span>'))
);
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