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
		localHooks.mustProvideWorkspace()
	],
	get: [],
	create: [
		localHooks.mustProvideWorkspace(),
		globalHooks.allowWorkspaceEditorOrHigher()
	],
	update: [
		globalHooks.allowWorkspaceEditorOrHigher()
	],
	patch: [
		globalHooks.allowWorkspaceEditorOrHigher()
	],
	remove: [
		globalHooks.allowWorkspaceEditorOrHigher(),
		localHooks.removeAssociated()
	]
};

exports.after = {
	all: [],
	find: [],
	get: [],
	create: [
		localHooks.createDefaultView()
	],
	update: [],
	patch: [],
	remove: [
		localHooks.updateCollectionPositions()
	]
};
