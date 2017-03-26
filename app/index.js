import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

import feathers from 'feathers-client';
import io from 'socket.io-client';
import localstorage from 'feathers-localstorage';

import 'pure-css';
import 'react-select/dist/react-select.css';
import 'animate.css/animate.min.css';
import './css/react-contextmenu.css';
import './css/react-datetime.css';
import './css/responsive-widths.css';
import './css/buttons.css';
import './css/custom.css';
import './css/colors.css';

import './rollbar.js';

import CollectionContainer from 'components/collectioncontainer';
import ConfigureWorkspace from 'components/configureworkspace';
import ConfigureCollection from 'components/configurecollection';
import ConfigureThing from 'components/configurething';
import ConfigureField from 'components/configurefield';
import ConfigureReference from 'components/configurereference';
import Skeleton from 'components/skeleton';

import Signup from 'pages/signup';
import Login from 'pages/login';
import Account from 'pages/account';
import Logout from 'pages/logout';
import Home from 'pages/home';
import Workspace from 'pages/workspace';
import Error from 'pages/error';

if (module.hot) {
	module.hot.accept();
}

// init feathers client
const socket = io();
window.feathersApp = feathers()
	.configure(feathers.socketio(socket))
	.configure(feathers.hooks())
	.configure(feathers.authentication({ storage: window.localStorage }))
	.use('localdata', localstorage({ storage: window.localStorage }));

// handle auth and redirect after auth
function requireAuth(nextState, replace, callback) {
	// if not logged in, redirect to login and store redirect
	if (!feathersApp.get('user')) {
		feathersApp.service('localdata').create({'id': 'redirectAfterLogin', 'data': nextState});
		replace('/login');
		callback();
	} else { // if just logged in and redirect is stored, go there
		feathersApp.service('localdata').get('redirectAfterLogin').then(result => {
			replace(result.data.location.pathname + result.data.location.search);
			feathersApp.service('localdata').remove('redirectAfterLogin').then(() => {
				callback();
			});
		}).catch(error => {
			// no stored redirect, continue
			callback();
		});
	}
}

// define routes
class Root extends React.Component {
	render() {
		return (
			<Router history={browserHistory}>
				<Route path="/" component={Skeleton}>
					<IndexRoute component={Home} onEnter={requireAuth} />
					<Route path="workspace/:workspace" onEnter={requireAuth} component={Workspace}>
						<Route path="configure" component={ConfigureWorkspace} />
						<Route path="collection/:collection" component={CollectionContainer}>
							<Route path="configure" component={ConfigureCollection} />
							<Route path="thing/:thing" component={ConfigureThing} />
							<Route path="field/:field" component={ConfigureField} />
							<Route path="reference/:thing/:field" component={ConfigureReference} />
						</Route>
					</Route>
					<Route path="account" component={Account} onEnter={requireAuth} />
					<Route path="login" component={Login} />
					<Route path="signup" component={Signup} />
					<Route path="logout" component={Logout} onEnter={feathersApp.logout} />
					<Route path="*" component={Error} />
				</Route>
			</Router>
		);
	}
}

// authenticate user and start the app
feathersApp.authenticate().catch(error => {
	console.error('Error authenticating!', error);
}).then(result => {
	ReactDOM.render( <Root />, document.getElementById('app') );
	feathersApp.service('users').on('patched', user => {
		if (user._id === feathersApp.get('user')._id) {
			feathersApp.set('user', user);
		}
	});
});
