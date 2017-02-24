import React from 'react';
import { Link, withRouter } from 'react-router';

import MessageBanner from '../components/messagebanner.jsx';

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
			<div className="pure-g">
				<div className="pure-u-1 pure-u-sm-1-4 pure-u-md-1-3" />
				<div className="pure-u-1 pure-u-sm-1-2 pure-u-md-1-3 card withshadow">
					<form className="pure-form pure-form-stacked" onSubmit={this.handleSubmit.bind(this)}>
						<fieldset>
							<legend>Sign up</legend>
							<div className="pure-control-group">
								<label htmlFor="email">Email Address</label>
								<input id="email" type="email" placeholder="Email Address" onChange={this.handleChange.bind(this)} />
							</div>
							<div className="pure-control-group">
								<label htmlFor="password1">Password</label>
								<input id="password1" type="password" placeholder="Password" onChange={this.handleChange.bind(this)} />
							</div>
							<div className="pure-control-group">
								<label htmlFor="password2">Password (again)</label>
								<input id="password2" type="password" placeholder="Password" onChange={this.handleChange.bind(this)} />
							</div>
							<div className="pure-controls">
								<button className="pure-button pure-button-primary" type="submit">Sign up</button>
							</div>
						</fieldset>
					</form>
					<Link to="/login">Log in</Link>
				</div>
			</div>
		</div>
	); }
}

module.exports = withRouter(Signup);
