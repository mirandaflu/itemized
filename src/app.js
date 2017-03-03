'use strict';

const path = require('path');
const serveStatic = require('feathers').static;
const favicon = require('serve-favicon');
const compress = require('compression');
const cors = require('cors');
const feathers = require('feathers');
const configuration = require('feathers-configuration');
const hooks = require('feathers-hooks');
const rest = require('feathers-rest');
const bodyParser = require('body-parser');
const socketio = require('feathers-socketio');
const middleware = require('./middleware');
const services = require('./services');

const app = feathers();

if (process.env.NODE_ENV != 'production') {
	const config = require('../webpack.dev.config.js');
	const webpack = require('webpack');
	const compiler = webpack(config);
	app.use(require('webpack-dev-middleware')(compiler, {
		noInfo: true,
		publicPath: config.output.publicPath,
		historyApiFallback: true
	}));
	app.use(require('webpack-hot-middleware')(compiler));
}

app.configure(configuration(path.join(__dirname, '..')));

app.use(compress())
	.options('*', cors())
	.use(cors())
	.use(favicon( path.join( __dirname, '../app/favicon.ico') ))
	.use('/', serveStatic( __dirname + '../dist/' ))
	.use(bodyParser.json())
	.use(bodyParser.urlencoded({ extended: true }))
	.configure(hooks())
	.configure(rest())
	.configure(socketio())
	.configure(services)
	.configure(middleware)
	.enable("trust proxy");

module.exports = app;
