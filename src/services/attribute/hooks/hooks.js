'use strict';

exports.createIfNotExists = function(options) {
	return function(hook) {
		return new Promise((resolve, reject) => {
			if (hook.id) { resolve(hook); }
			else if (!hook.params.query.coll || !hook.params.query.thing || !hook.params.query.field) {
				reject(new Error('Failed to upsert attribute'));
			}
			else {
				return hook.app.service('attributes').find({query:hook.params.query}).then(attrs => {
					if (attrs.length == 0) {
						return hook.app.service('attributes').create(hook.params.query).then(result => {
							resolve(hook);
						}).catch(reject);
					}
					else resolve(hook);
				})
			}
		});
	};
};