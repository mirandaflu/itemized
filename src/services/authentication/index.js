'use strict';

const authentication = require('feathers-authentication');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GoogleTokenStrategy = require('passport-google-token').Strategy;

module.exports = function() {
	const app = this;

	let config = app.get('auth');
	
	if (config.google) {
		config.google.strategy = GoogleStrategy;
		config.google.tokenStrategy = GoogleTokenStrategy;
	}

	app.set('auth', config);
	app.configure(authentication(config));
};
