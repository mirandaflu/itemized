'use strict';

const service = require('feathers-mongoose');
const field = require('./field-model');
const hooks = require('./hooks');
const byCheckingWorkspace = require('../../filters/bycheckingworkspace.js');

module.exports = function() {
	const app = this;

	const options = {
		Model: field,
		paginate: false
	};

	// Initialize our service with any options it requires
	app.use('/fields', service(options));

	// Get our initialize service to that we can bind hooks
	const fieldService = app.service('/fields');

	// Set up our before hooks
	fieldService.before(hooks.before);

	// Set up our after hooks
	fieldService.after(hooks.after);

	// Filter socket events: only users currently viewing the collection get updates
	fieldService.filter(byCheckingWorkspace);
};
