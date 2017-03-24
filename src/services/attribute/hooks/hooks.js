'use strict';

exports.createIfNotExists = options => {
	return hook => {
		return new Promise((resolve, reject) => {
			if (hook.id) {
				return resolve(hook);
			} else if (!hook.params.query.coll || !hook.params.query.thing || !hook.params.query.field) {
				return reject(new Error('Failed to upsert attribute'));
			}
			return hook.app.service('attributes').find({query: hook.params.query}).then(attrs => {
				if (attrs.length === 0) {
					return hook.app.service('attributes').create(hook.params.query).then(result => {
						resolve(hook);
					}).catch(reject);
				}
				return resolve(hook);
			});
		});
	};
};
