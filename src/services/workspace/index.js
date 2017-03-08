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

	// Filter socket events: only users with a role in the workspace get updates
	workspaceService.filter(function(data, connection, hook) {
		let userID = connection.user._id.toString(),
			owner = data.owner.toString(),
			admins = data.admins.map((o) => o.toString()),
			editors = data.editors.map((o) => o.toString()),
			viewers = data.viewers.map((o) => o.toString());
		if (userID != owner && admins.indexOf(userID) == -1 && editors.indexOf(userID) == -1 && viewers.indexOf(userID) == -1) {
			return false;
		}
		else {
			return data;
		}
	});
};
