'use strict';

const service = require('feathers-mongoose');
const thing = require('./thing-model');
const hooks = require('./hooks');
const byCheckingWorkspace = require('../../filters/bycheckingworkspace.js');

module.exports = function() {
	const app = this;

	const options = {
		Model: thing,
		paginate: {
			default: 100,
			max: Infinity
		}
	};

	// Initialize our service with any options it requires
	app.use('/things', service(options));

	// Get our initialize service to that we can bind hooks
	const thingService = app.service('/things');

	// Set up our before hooks
	thingService.before(hooks.before);

	// Set up our after hooks
	thingService.after(hooks.after);

	// Filter socket events: only users currently viewing the collection get updates
	thingService.filter(byCheckingWorkspace);
};
