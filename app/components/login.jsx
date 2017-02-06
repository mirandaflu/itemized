import React from 'react';
import { Link, withRouter } from 'react-router';

import MessageBanner from './messagebanner.jsx';

class Login extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			email: '',
			password: ''
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
		let auth = {
			type: 'local',
			email: this.state.email,
			password: this.state.password
		};
		feathers_app.authenticate(auth)
			.then(result => { this.props.router.push('/'); })
			.catch(error => {
				console.log(error);
				this.refs.messageBanner.showMessage('Error authenticating: ' + error);
			});
	}
	render() { return (
		<div>
			<MessageBanner ref="messageBanner" />

			<form className="pure-form pure-form-stacked" onSubmit={this.handleSubmit.bind(this)}>
				<fieldset>
					<legend>Log in</legend>
					<input id="email" type="email" placeholder="Email Address" onChange={this.handleChange.bind(this)} />
					<input id="password" type="password" placeholder="Password" onChange={this.handleChange.bind(this)} />
					<button type="submit">Log in</button>
				</fieldset>
			</form>
			<Link to="/signup">Sign up</Link>
		</div>
	); }
}

module.exports = withRouter(Login);
