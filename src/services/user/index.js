'use strict';

const service = require('feathers-mongoose');
const user = require('./user-model');
const hooks = require('./hooks');

module.exports = function exports() {
	const app = this;

	const options = {
		Model: user,
		paginate: {
			default: 5,
			max: 25
		}
	};

	// Initialize our service with any options it requires
	app.use('/users', service(options));

	// Get our initialize service to that we can bind hooks
	const userService = app.service('/users');

	// Set up our before hooks
	userService.before(hooks.before);

	// Set up our after hooks
	userService.after(hooks.after);

	// Filter socket events: only the user sees their own changes
	userService.filter((data, connection, hook) => {
		if (data._id.toString() === connection.user._id.toString()) {
			return data;
		}
		return false;
	});
};
