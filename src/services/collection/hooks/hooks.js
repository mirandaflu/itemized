'use strict';

exports.removeAssociated = function(options) {
	return function(hook) {
		return new Promise((resolve, reject) => {
			hook.app.service('fields').remove(null, {query: {coll: hook.id}}).then(result => {
				hook.app.service('things').remove(null, {query: {coll: hook.id}}).then(result => {
					hook.app.service('views').remove(null, {query: {coll: hook.id}}).then(result => {
						resolve(hook);
					}).catch(reject);
				}).catch(reject);
			}).catch(reject);
		});
	};
};

exports.updateCollectionPositions = function(options) {
	return function(hook) {
		return new Promise((resolve, reject) => {
			if (hook.id == null) return resolve(hook);
			hook.app.service('collections').patch(null, {$inc: {position: -1}}, {query: {
				workspace: hook.result.workspace,
				position: {$gte: hook.result.position}
			}}).then(result => {
				resolve(hook);
			}).catch(reject);
		});
	};
};

exports.mustProvideWorkspace = function(options) {
	return function(hook) {
		return new Promise((resolve, reject) => {
			if (!hook.params.query.workspace && !hook.data.workspace) reject(new Error('You must specify a workspace to find collections.'));
			else resolve(hook);
		});
	};
};

exports.createDefaultView = function(options) {
	return function(hook) {
		return new Promise((resolve, reject) => {
			hook.app.service('views').create({coll: hook.result._id, default: true, name: 'Default View'}).then(view => {
				hook.app.service('collections').patch(hook.result._id, {defaultView: view._id}).then(collection => {
					resolve(hook);
				}).catch(reject);
			}).catch(reject);
		});
	};
};
