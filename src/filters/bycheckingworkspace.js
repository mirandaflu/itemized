'use strict';

module.exports = function(data, connection, hook) {
	return new Promise((resolve, reject) => {
		let userID = connection.user._id.toString();
		if (data.workspace) {
			hook.app.service('workspaces').get(data.workspace).then(workspace => {
				let owner = workspace.owner.toString(),
					admins = workspace.admins.map((o) => o.toString()),
					editors = workspace.editors.map((o) => o.toString()),
					viewers = workspace.viewers.map((o) => o.toString());
				if (userID != owner && admins.indexOf(userID) == -1 && editors.indexOf(userID) == -1 && viewers.indexOf(userID) == -1) {
					reject();
				}
				else {
					resolve(data);
				}
			}).catch(reject);
		}
		else if (data.coll) {
			hook.app.service('collections').get(data.coll).then(coll => {
				hook.app.service('workspaces').get(coll.workspace).then(workspace => {
					let owner = workspace.owner.toString(),
						admins = workspace.admins.map((o) => o.toString()),
						editors = workspace.editors.map((o) => o.toString()),
						viewers = workspace.viewers.map((o) => o.toString());
					if (userID != owner && admins.indexOf(userID) == -1 && editors.indexOf(userID) == -1 && viewers.indexOf(userID) == -1) {
						reject();
					}
					else {
						resolve(data);
					}
				}).catch(reject);
			}).catch(reject);
		}
		else {
			reject();
		}
	});
};