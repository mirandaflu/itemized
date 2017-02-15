exports.removeAssociated = function(options) {
	return function(hook) {
		return new Promise((resolve, reject) => {
			hook.app.service('attributes').remove(null, {query: {field: hook.id}}).then(result => {
				resolve(hook);
			}).catch(reject);
		});
	};
};

exports.updateFieldPositions = function(options) {
	return function(hook) {
		return new Promise((resolve, reject) => {
			if (hook.id == null) return resolve(hook);
			hook.app.service('fields').patch(null, {$inc: {position: -1}}, {query: {
				coll: hook.result.coll,
				position: {$gte: hook.result.position}
			}}).then(result => {
				resolve(hook);
			}).catch(reject);
		});
	};
};
