exports.removeAssociated = function(options) {
	return function(hook) {
		return new Promise((resolve, reject) => {
			hook.app.service('collections').remove(null, {query: {workspace: hook.id}}).then(result => {
				resolve(hook);
			}).catch(reject);
		});
	};
};

exports.restrictToAnyRole = function(options) {
	return function(hook) {
		return new Promise((resolve, reject) => {
			hook.params.query = {$and: [
				{$or: [
					{owner: hook.params.user},
					{admins: hook.params.user},
					{editors: hook.params.user},
					{viewers: hook.params.user}
				]},
				hook.params.query
			]};
			resolve(hook);
		});
	};
};

exports.restrictToEditorOrHigher = function(options) {
	return function(hook) {
		return new Promise((resolve, reject) => {
			// only let owner or admin share
			if (hook.data.owner || hook.data.admins || hook.data.editors || hook.data.viewers) {
				hook.params.query = {$and: [
					{$or: [
						{owner: hook.params.user},
						{admins: hook.params.user}
					]},
					hook.params.query
				]};
				resolve(hook);
			}
			// let owner, admin, and editor edit
			else {
				hook.params.query = {$and: [
					{$or: [
						{owner: hook.params.user},
						{admins: hook.params.user},
						{editors: hook.params.user}
					]},
					hook.params.query
				]};
				resolve(hook);
			}
		});
	};
};

exports.restrictToAdminOrHigher = function(options) {
	return function(hook) {
		return new Promise((resolve, reject) => {
			hook.params.query = {$and: [
				{$or: [
					{owner: hook.params.user},
					{admins: hook.params.user}
				]},
				hook.params.query
			]};
			resolve(hook);
		});
	};
};