import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

import feathers from 'feathers-client';
import io from 'socket.io-client';
import localstorage from 'feathers-localstorage';

import './css/react-contextmenu.css';
import 'react-select/dist/react-select.css';
import './css/buttons.css';
import './css/custom.css';

import Skeleton from './components/skeleton.jsx';
import Signup from './components/signup.jsx';
import Login from './components/login.jsx';
import Logout from './components/logout.jsx';

import CollectionContainer from './components/collectioncontainer.jsx';

import Home from './pages/home.jsx';
import Workspace from './pages/workspace.jsx';
import Error from './pages/error.jsx';

if (module.hot) {
	module.hot.accept();
}

// init feathers client
const socket = io();
window.feathers_app = feathers()
	.configure(feathers.socketio(socket))
	.configure(feathers.hooks())
	.configure(feathers.authentication({ storage: window.localStorage }))
	.use('localdata', localstorage({ storage: window.localStorage }));

// handle auth and redirect after auth
function requireAuth(nextState, replace, callback) {

	// if not logged in, redirect to login and store redirect
	if (!feathers_app.get('user')) {
		feathers_app.service('localdata').create({'id':'redirectAfterLogin', 'data':nextState});
		replace('/login');
		callback();
	}

	// if just logged in and redirect is stored, go there
	else {
		feathers_app.service('localdata').get('redirectAfterLogin').then(result => {
			replace(result.data.location.pathname + result.data.location.search);
			feathers_app.service('localdata').remove('redirectAfterLogin').then(result => {
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
					<IndexRoute component={Home} onEnter={requireAuth}></IndexRoute>
					<Route path="workspace/:workspace" onEnter={requireAuth} component={Workspace}>
						<Route path="collection/:collection" component={CollectionContainer} />
					</Route>
					<Route path="login" component={Login}></Route>
					<Route path="signup" component={Signup}></Route>
					<Route path="logout" component={Logout} onEnter={feathers_app.logout}></Route>
					<Route path="*" component={Error} />
				</Route>
			</Router>
		);
	}
}

// authenticate user and start the app
feathers_app.authenticate().catch(error => {
	console.error('Error authenticating!', error);
}).then(result => {
	render( <Root />, document.getElementById('app') );
});

