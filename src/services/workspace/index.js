'use strict';

const service = require('feathers-mongoose');
const workspace = require('./workspace-model');
const hooks = require('./hooks');

module.exports = function exports() {
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
	workspaceService.filter((data, connection, hook) => {
		const userID = connection.user._id.toString();
		const owner = data.owner.toString();
		const admins = data.admins.map((o) => o.toString());
		const editors = data.editors.map((o) => o.toString());
		const viewers = data.viewers.map((o) => o.toString());
		if (userID !== owner && admins.indexOf(userID) === -1 && editors.indexOf(userID) === -1 && viewers.indexOf(userID) === -1) {
			return false;
		}
		return data;
	});
};
