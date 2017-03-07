import React from 'react';
import { Link } from 'react-router';

import MessageBanner from '../components/messagebanner.jsx';

export default class Account extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			username: null,
			border: 'lightgreen'
		};
	}
	handleUsernameChange() {
		this.setState({
			username: this.refs.username.value,
			border: 'orange'
		});
	}
	updateUserName(event) {
		event.preventDefault();
		if (this.refs.username.value == '') {
			feathers_app.service('users').patch(feathers_app.get('user')._id, { $unset: { username: 1 } })
				.then(result => {
					this.setState({ username: result.username, border: 'lightgrey' });
					this.refs.messageBanner.clearMessage();
				})
				.catch(error => {
					this.setState({ border: 'red' });
					if (error.message.indexOf('duplicate') != -1) error.message = 'That username is taken'
					this.refs.messageBanner.showMessage('Error: '+error.message);
				});
		}
		else {
			feathers_app.service('users').patch(feathers_app.get('user')._id, { username: this.refs.username.value })
				.then(result => {
					this.setState({ username: result.username, border: 'lightgreen' });
					this.refs.messageBanner.clearMessage();
				})
				.catch(error => {
					this.setState({ border: 'red' });
					if (error.message.indexOf('duplicate') != -1) error.message = 'That username is taken'
					this.refs.messageBanner.showMessage('Error: '+error.message);
				});
		}
	}
	componentDidMount() {
		feathers_app.service('users').get(feathers_app.get('user')._id)
			.then(result => {
				this.setState({
					username: result.username,
					border: (result.username == null)? 'lightgrey': 'lightgreen'
				});
			})
			.catch(console.error);
	}
	render() {
		return (
			<div className="workspace">
				<MessageBanner ref="messageBanner" />
				<form className="pure-form pure-form-aligned" onSubmit={this.updateUserName.bind(this)}>
					<legend>Set a username to enable sharing</legend>
					<fieldset>
						<div className="pure-control-group">
							<label htmlFor="username">Username</label>
							<input ref="username" type="text" placeholder="Username"
								style={{border:'1px solid '+this.state.border}}
								value={this.state.username}
								onChange={this.handleUsernameChange.bind(this)} />
						</div>
						<div className="pure-controls" style={{marginTop:0}}>
							<button type="submit" className="pure-button button-secondary">Set</button>
						</div>
					</fieldset>
				</form>
				<Link to="/logout" className="pure-button button-error">Log out</Link>
			</div>
		);
	}
}