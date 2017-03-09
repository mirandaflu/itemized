import React from 'react';
import { Link, withRouter } from 'react-router';

import GoogleButton from '../components/googlebutton.jsx';
import MessageBanner from '../components/messagebanner.jsx';

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
				console.error(error);
				this.refs.messageBanner.showMessage('Error authenticating: ' + error.message);
			});
	}
	render() { return (
		<div>
			<MessageBanner ref="messageBanner" />
			<div className="pure-g">
				<div className="pure-u-1 pure-u-sm-1-4 pure-u-md-1-3" />
				<div className="pure-u-1 pure-u-sm-1-2 pure-u-md-1-3 card withshadow">
					<p>
						Welcome to <strong>Itemized</strong> - part spreadsheet, part kanban board, still growing and changing
					</p>
					<div style={{textAlign:'center'}}>
						<GoogleButton preposition="in" />
					</div>
					<p style={{color:'grey'}}>
						This app doesn't use any of your Google account data,
						this just saves <Link to="https://github.com/mirandaflu">me</Link> from having to
						send password reset emails.
					</p>
					{window.location.host == 'localhost:3030' &&
						<form className="pure-form pure-form-stacked" onSubmit={this.handleSubmit.bind(this)}>
							<fieldset>
								<legend>Log in</legend>
								<div className="pure-control-group">
									<label htmlFor="email">Email Address</label>
									<input id="email" type="email" placeholder="Email Address" onChange={this.handleChange.bind(this)} />
								</div>
								<div className="pure-control-group">
									<label htmlFor="password">Password</label>
									<input id="password" type="password" placeholder="Password" onChange={this.handleChange.bind(this)} />
								</div>
								<div className="pure-controls">
									<button className="pure-button pure-button-primary" type="submit">Log in</button>
								</div>
							</fieldset>
						</form>
					}
					{window.location.host == 'localhost:3030' &&
						<Link to="/signup">Sign up</Link>
					}
				</div>
			</div>
		</div>
	); }
}

module.exports = withRouter(Login);
