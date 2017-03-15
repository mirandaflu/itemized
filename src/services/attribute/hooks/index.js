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
		globalHooks.mustProvideCollection()
	],
	get: [],
	create: [
		globalHooks.mustProvideCollection(),
		globalHooks.allowWorkspaceEditorOrHigher()
	],
	update: [
		globalHooks.allowWorkspaceEditorOrHigher()
	],
	patch: [
		globalHooks.allowWorkspaceEditorOrHigher(),
		localHooks.createIfNotExists()
	],
	remove: [
		globalHooks.allowWorkspaceEditorOrHigher()
	]
};

exports.after = {
	all: [],
	find: [],
	get: [],
	create: [],
	update: [],
	patch: [],
	remove: []
};
