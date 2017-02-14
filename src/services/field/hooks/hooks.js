exports.removeAssociated = function(options) {
	return function(hook) {
		return new Promise((resolve, reject) => {
			hook.app.service('attributes').remove(null, {query: {field: hook.id}}).then(result => {
				resolve(hook);
			}).catch(reject);
		});
	};
};
