exports.removeAssociated = function(options) {
	return function(hook) {
		return new Promise((resolve, reject) => {
			hook.app.service('collections').remove(null, {query: {workspace: hook.id}}).then(result => {
				resolve(hook);
			}).catch(reject);
		});
	};
};
