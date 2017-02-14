exports.removeAssociated = function(options) {
	return function(hook) {
		return new Promise((resolve, reject) => {
			hook.app.service('fields').remove(null, {query: {coll: hook.id}}).then(result => {
				hook.app.service('things').remove(null, {query: {coll: hook.id}}).then(result => {
					resolve(hook);
				}).catch(reject);
			}).catch(reject);
		});
	};
};
