'use strict';

// Add any common hooks you want to share across services in here.
// See http://docs.feathersjs.com/hooks/readme.html for more details
// on hooks.

const allowEditBasedOnWorkspace = result => {
	return new Promise((resolve, reject) => {
		let workspace = result.workspace, userID = result.userID,
			service = result.hook.service.Model.modelName, method = result.hook.method;
		let owner = workspace.owner.toString(),
			admins = workspace.admins.map((o) => o.toString()),
			editors = workspace.editors.map((o) => o.toString());
		if (userID != owner && admins.indexOf(userID) == -1 && editors.indexOf(userID) == -1) {
			reject(new Error('You are not allowed to '+method+' a '+service+' in this workspace.'));
		}
		else {
			resolve();
		}
	});
};

exports.allowWorkspaceEditorOrHigher = function(options) {
	return function(hook) {
		return new Promise((resolve, reject) => {
			if (!hook.params.provider) {
				return resolve(hook);
			}
			let userID = hook.params.user._id.toString();
			if (hook.service.Model.modelName == 'collection') {
				if (hook.method == 'create') {
					hook.app.service('workspaces')
						.get(hook.data.workspace)
						.then(workspace => { return {
							workspace: workspace,
							userID: userID,
							hook: hook
						}; })
						.then(allowEditBasedOnWorkspace)
						.then(result => { resolve(hook); })
						.catch(reject);
				}
				else if (hook.id) {
					hook.service.get(hook.id).then(collection => {
						hook.app.service('workspaces')
							.get(collection.workspace)
							.then(workspace => { return {
								workspace: workspace,
								userID: userID,
								hook: hook
							}; })
							.then(allowEditBasedOnWorkspace)
							.then(result => { resolve(hook); })
							.catch(reject);
					}).catch(reject);
				}
				else reject(new Error('Unknown error occurred while checking permissions 1'));
			}
			else if (['attribute','field','thing'].indexOf(hook.service.Model.modelName) != -1) {
				if (hook.method == 'create') {
					hook.app.service('collections').get(hook.data.coll).then(collection => {
						hook.app.service('workspaces')
							.get(collection.workspace)
							.then(workspace => { return {
								workspace: workspace,
								userID: userID,
								hook: hook
							}; })
							.then(allowEditBasedOnWorkspace)
							.then(result => { resolve(hook); })
							.catch(reject);
					}).catch(reject);
				}
				else if (hook.id) {
					hook.service.get(hook.id).then(result => {
						hook.app.service('collections').get(result.coll).then(collection => {
							hook.app.service('workspaces')
								.get(collection.workspace)
								.then(workspace => { return {
									workspace: workspace,
									userID: userID,
									hook: hook
								}; })
								.then(allowEditBasedOnWorkspace)
								.then(result => { resolve(hook); })
								.catch(reject);
						}).catch(reject);
					}).catch(reject);
				}
				else if (hook.service.Model.modelName == 'attribute' && hook.method == 'patch' &&
				hook.params.query.field && hook.params.query.thing) {
					resolve(hook);
				}
				else reject(new Error('Unknown error occurred while checking permissions 2'));
			}
			else reject(new Error('Unknown error occurred while checking permissions 3'));
		});
	};
};

exports.mustProvideCollection = function(options) {
	return function(hook) {
		return new Promise((resolve, reject) => {
			if ((hook.params.query && !hook.params.query.coll) && !hook.data.coll) {
				reject(new Error('You must specify a collection to '+hook.method+' '+hook.service.Model.modelName+'s.'));
			}
			else resolve(hook);
		});
	};
};