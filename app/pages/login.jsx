import React from 'react';
import { Link, withRouter } from 'react-router';

import GoogleButton from 'components/googlebutton';
import MessageBanner from 'components/messagebanner';

class Login extends React.Component {
	state = {
		email: '',
		password: ''
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
		const auth = {
			type: 'local',
			email: this.state.email,
			password: this.state.password
		};
		return feathersApp.authenticate(auth)
			.then(result => { this.props.router.push('/'); })
			.catch(error => {
				this.refs.messageBanner.showMessage('Error authenticating: ' + error.message);
				console.error(error);
			});
	}
	render() {
		return (
			<div>
				<MessageBanner ref="messageBanner" />
				<div className="pure-g">
					<div className="pure-u-1 pure-u-sm-1-4 pure-u-md-1-3" />
					<div className="pure-u-1 pure-u-sm-1-2 pure-u-md-1-3 card withshadow">
						<p>
							Welcome to <strong>Itemized</strong> - part spreadsheet, part kanban board, still growing and changing
						</p>
						<div style={{textAlign: 'center'}}>
							<GoogleButton preposition="in" />
						</div>
						<p style={{color: 'grey'}}>
							This app doesn't use any of your Google account data,
							this just saves <Link to="https://github.com/mirandaflu">me</Link> from having to
							send password reset emails.
						</p>
						{window.location.host === 'localhost:3030' &&
							<form className="pure-form pure-form-stacked" onSubmit={this.handleSubmit}>
								<fieldset>
									<legend>Log in</legend>
									<div className="pure-control-group">
										<label htmlFor="email">Email Address</label>
										<input id="email" type="email" placeholder="Email Address" onChange={this.handleChange} />
									</div>
									<div className="pure-control-group">
										<label htmlFor="password">Password</label>
										<input id="password" type="password" placeholder="Password" onChange={this.handleChange} />
									</div>
									<div className="pure-controls">
										<button className="pure-button pure-button-primary" type="submit">Log in</button>
									</div>
								</fieldset>
							</form>
						}
						{window.location.host === 'localhost:3030' &&
							<Link to="/signup">Sign up</Link>
						}
					</div>
				</div>
			</div>
		);
	}
}

module.exports = withRouter(Login);
