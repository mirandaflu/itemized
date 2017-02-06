import React from 'react';
import { Link, withRouter } from 'react-router';

import MessageBanner from './messagebanner.jsx';

class Signup extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			email: '',
			password1: '',
			password2: ''
		};
	}
	handleChange(e) {
		let s = {};
		s[e.target.id] = e.target.value;
		this.setState(s);
	}
	handleSubmit(e) {
		e.preventDefault();
		if (this.state.password1 != this.state.password2) {
			return this.refs.messageBanner.showMessage('Passwords don\'t match');
		}
		let user = {
			email: this.state.email,
			password: this.state.password1
		};
		feathers_app.service('users').create(user).then(result => {
			let auth = {
				type: 'local',
				email: user.email,
				password: user.password
			};
			feathers_app.authenticate(auth)
				.then(result => { this.props.router.push('/'); })
				.catch(error => { this.refs.messageBanner.showMessage('Error authenticating: ' + error); });
		})
		.catch(error => { this.refs.messageBanner.showMessage('Error creating account: ' + error); });
	}
	render() { return (
		<div>
			<MessageBanner ref="messageBanner" />

			<form onSubmit={this.handleSubmit.bind(this)}>
				<input id="email" type="email" placeholder="Email Address" onChange={this.handleChange.bind(this)} />
				<input id="password1" type="password" placeholder="Password" onChange={this.handleChange.bind(this)} />
				<input id="password2" type="password" placeholder="Password" onChange={this.handleChange.bind(this)} />
				<button type="submit">Sign up</button>
			</form>
			<Link to="/login">Log in</Link>
		</div>
	); }
}

module.exports = withRouter(Signup);
