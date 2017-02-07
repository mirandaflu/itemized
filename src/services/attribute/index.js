'use strict';

const service = require('feathers-mongoose');
const attribute = require('./attribute-model');
const hooks = require('./hooks');

module.exports = function() {
	const app = this;

	const options = {
		Model: attribute,
		paginate: false
	};

	// Initialize our service with any options it requires
	app.use('/attributes', service(options));

	// Get our initialize service to that we can bind hooks
	const attributeService = app.service('/attributes');

	// Set up our before hooks
	attributeService.before(hooks.before);

	// Set up our after hooks
	attributeService.after(hooks.after);
};
