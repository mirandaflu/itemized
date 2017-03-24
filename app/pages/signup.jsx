import React from 'react';
import { Link, withRouter } from 'react-router';

import GoogleButton from '../components/googlebutton.jsx';
import MessageBanner from '../components/messagebanner.jsx';

class Signup extends React.Component {
	state = {
		email: '',
		password1: '',
		password2: ''
	}
	handleChange = (event) => {
		const s = {};
		s[event.target.id] = event.target.value;
		this.setState(s);
	}
	handleSubmit = (event) => {
		event.preventDefault();
		if (this.state.password1 !== this.state.password2) {
			return this.refs.messageBanner.showMessage('Passwords don\'t match');
		}
		const user = {
			email: this.state.email,
			password: this.state.password1
		};
		return feathersApp.service('users').create(user).then(() => {
			const auth = {
				type: 'local',
				email: user.email,
				password: user.password
			};
			feathersApp.authenticate(auth)
				.then(() => { this.props.router.push('/'); })
				.catch(error => { this.refs.messageBanner.showMessage('Error authenticating: ' + error); });
		})
		.catch(error => { this.refs.messageBanner.showMessage('Error creating account: ' + error); });
	}
	render() {
		return (
			<div>
				<MessageBanner ref="messageBanner" />
				<div className="pure-g">
					<div className="pure-u-1 pure-u-sm-1-4 pure-u-md-1-3" />
					<div className="pure-u-1 pure-u-sm-1-2 pure-u-md-1-3 card withshadow">
						<div style={{textAlign: 'center'}}>
							<GoogleButton preposition="up" />
						</div>
						<form className="pure-form pure-form-stacked" onSubmit={this.handleSubmit}>
							<fieldset>
								<legend>Sign up</legend>
								<div className="pure-control-group">
									<label htmlFor="email">Email Address</label>
									<input id="email" type="email" placeholder="Email Address" onChange={this.handleChange} />
								</div>
								<div className="pure-control-group">
									<label htmlFor="password1">Password</label>
									<input id="password1" type="password" placeholder="Password" onChange={this.handleChange} />
								</div>
								<div className="pure-control-group">
									<label htmlFor="password2">Password (again)</label>
									<input id="password2" type="password" placeholder="Password" onChange={this.handleChange} />
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
		);
	}
}

module.exports = withRouter(Signup);
