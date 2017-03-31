exports.removeAssociated = options => {
	return hook => {
		return new Promise((resolve, reject) => {
			hook.app.service('collections').remove(null, {query: {workspace: hook.id}}).then(result => {
				resolve(hook);
			}).catch(reject);
		});
	};
};

exports.restrictToAnyRole = options => {
	return hook => {
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

exports.restrictToEditorOrHigher = options => {
	return hook => {
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
			} else { // let owner, admin, and editor edit
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

exports.restrictToAdminOrHigher = options => {
	return hook => {
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

exports.onlyReturnIfUserHasRole = options => {
	return hook => {
		return new Promise((resolve, reject) => {
			if (!hook.params.provider) return resolve(hook);
			const workspace = hook.result;
			const userID = hook.params.user._id.toString();
			const owner = workspace.owner.toString();
			const admins = workspace.admins.map((o) => o.toString());
			const editors = workspace.editors.map((o) => o.toString());
			const viewers = workspace.viewers.map((o) => o.toString());
			if (userID !== owner && admins.indexOf(userID) === -1 && editors.indexOf(userID) === -1 && viewers.indexOf(userID)) {
				return reject(new Error('You are not allowed to view this workspace.'));
			}
			return resolve(hook);
		});
	};
};
