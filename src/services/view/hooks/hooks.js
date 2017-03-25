'use strict';

exports.maintainOneDefaultPerCollection = options => {
	return hook => {
		return new Promise((resolve, reject) => {
			if (!hook.params.provider) {
				return resolve(hook);
			} else if (hook.data.default === true) {
				return hook.app.service('views').get(hook.id).then(view => {
					hook.app.service('views').patch(null, {default: false}, {query: {coll: view.coll}}).then(() => {
						resolve(hook);
					}).catch(reject);
				}).catch(reject);
			}
			return resolve(hook);
		});
	};
};
