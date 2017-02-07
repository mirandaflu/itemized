'use strict';
const field = require('./field');
const attribute = require('./attribute');
const thing = require('./thing');
const collection = require('./collection');
const workspace = require('./workspace');
const authentication = require('./authentication');
const user = require('./user');
const mongoose = require('mongoose');

module.exports = function() {
	const app = this;

	mongoose.connect(app.get('mongodb'));
	mongoose.Promise = global.Promise;

	app.configure(authentication);
	app.configure(user);
	app.configure(workspace);
	app.configure(collection);
	app.configure(thing);
	app.configure(attribute);
	app.configure(field);
};
