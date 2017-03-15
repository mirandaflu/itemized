'use strict';

exports.removeAssociated = function(options) {
	return function(hook) {
		return new Promise((resolve, reject) => {
			hook.app.service('attributes').remove(null, {query: {thing: hook.id}}).then(result => {
				resolve(hook);
			}).catch(reject);
		});
	};
};

exports.createDefaultAttributes = function(options) {
	return function(hook) {
		return new Promise((resolve, reject) => {
			hook.app.service('fields').find({query:{coll:hook.result.coll}}).then(fields => {
				Promise.all(fields.filter(field => { return field.default != null; }).map(field => {
					let attribute = {
						coll: hook.result.coll,
						thing: hook.result._id,
						field: field._id,
						value: field.default
					};
					return hook.app.service('attributes').create(attribute).catch(reject);
				})).then(result => {
					resolve(hook);
				}).catch(reject);
			}).catch(reject);
		});
	};
};