'use strict';

const service = require('feathers-mongoose');
const collection = require('./collection-model');
const hooks = require('./hooks');
const byCheckingWorkspace = require('../../filters/bycheckingworkspace.js');

module.exports = function() {
	const app = this;

	const options = {
		Model: collection,
		paginate: false
	};

	// Initialize our service with any options it requires
	app.use('/collections', service(options));

	// Get our initialize service to that we can bind hooks
	const collectionService = app.service('/collections');

	// Set up our before hooks
	collectionService.before(hooks.before);

	// Set up our after hooks
	collectionService.after(hooks.after);

	// Filter socket events: only users viewing the workspace get updates
	collectionService.filter(byCheckingWorkspace);
};
