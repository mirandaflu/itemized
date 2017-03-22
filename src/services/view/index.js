'use strict';

const service = require('feathers-mongoose');
const view = require('./view-model');
const hooks = require('./hooks');
const byCheckingWorkspace = require('../../filters/bycheckingworkspace.js');

module.exports = function() {
	const app = this;

	const options = {
		Model: view,
		paginate: false
	};

	// Initialize our service with any options it requires
	app.use('/views', service(options));

	// Get our initialize service to that we can bind hooks
	const viewService = app.service('/views');

	// Set up our before hooks
	viewService.before(hooks.before);

	// Set up our after hooks
	viewService.after(hooks.after);

	// Filter socket events: viewers/editors/admins of the workspace get updates
	viewService.filter(byCheckingWorkspace);
};
