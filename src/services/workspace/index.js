'use strict';

const service = require('feathers-mongoose');
const workspace = require('./workspace-model');
const hooks = require('./hooks');

module.exports = function() {
	const app = this;

	const options = {
		Model: workspace,
		paginate: {
			default: 5,
			max: 25
		}
	};

	// Initialize our service with any options it requires
	app.use('/workspaces', service(options));

	// Get our initialize service to that we can bind hooks
	const workspaceService = app.service('/workspaces');

	// Set up our before hooks
	workspaceService.before(hooks.before);

	// Set up our after hooks
	workspaceService.after(hooks.after);
};
