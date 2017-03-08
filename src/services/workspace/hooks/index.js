'use strict';

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');
const auth = require('feathers-authentication').hooks;

const localHooks = require('./hooks.js');

exports.before = {
	all: [
		auth.verifyToken(),
		auth.populateUser(),
		auth.restrictToAuthenticated()
	],
	find: [
		localHooks.restrictToAnyRole()
	],
	get: [],
	create: [
		auth.associateCurrentUser({as: 'owner'})
	],
	update: [
		localHooks.restrictToEditorOrHigher()
	],
	patch: [
		localHooks.restrictToEditorOrHigher()
	],
	remove: [
		localHooks.restrictToAdminOrHigher()
	]
};

exports.after = {
	all: [],
	find: [],
	get: [],
	create: [],
	update: [],
	patch: [],
	remove: [
		localHooks.removeAssociated()
	]
};
