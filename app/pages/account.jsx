import React from 'react';
import Modal from 'react-modal';
import { Link } from 'react-router';

import MessageBanner from '../components/messagebanner.jsx';

export default class Account extends React.Component {
	state = {
		username: '',
		border: 'lightgreen',
		modalOpen: false
	}
	explainUsername = () => { this.setState({ modalOpen: true }); }
	closeModal = () => { this.setState({ modalOpen: false }); }
	handleUsernameChange = () => {
		this.setState({
			username: this.refs.username.value,
			border: 'orange'
		});
	}
	updateUserName = (event)  => {
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
				<form className="pure-form pure-form-aligned" onSubmit={this.updateUserName}>
					<legend>
						Set a username to enable sharing
						&nbsp;<i className="fa fa-question-circle-o" onClick={this.explainUsername} />
					</legend>
					<fieldset>
						<div className="pure-control-group">
							<label htmlFor="username">Username</label>
							<input ref="username" type="text" placeholder="Username"
								style={{border:'1px solid '+this.state.border}}
								value={this.state.username}
								onChange={this.handleUsernameChange} />
						</div>
						<div className="pure-controls" style={{marginTop:0}}>
							<button type="submit" className="pure-button button-secondary">Set</button>
						</div>
					</fieldset>
				</form>
				<Link to="/logout" className="pure-button button-error">Log out</Link>
				<Modal contentLabel="explainUsername" isOpen={this.state.modalOpen}>
					<div className="modalContent">
						<button className="pure-button button-small" onClick={this.closeModal}>
							<i className="fa fa-close" />
						</button>
						<h3>About Usernames</h3>
						<ul>
							<li><b>Usernames are searchable</b> by all other users</li>
							<li>To be invited to collaborate on a workspace, you must have a username</li>
							<li>To invite someone to collaborate on your workspace, type their username in the appropriate box on the workspace configuration screen</li>
							<li><b>You can change your username at any time</b>, provided the new name is not taken</li>
							<li>You can also clear your username by emptying the text box and clicking the set button
								<ul>
									<li>If you clear your username, you will not lose the workspaces shared with you</li>
									<li>The shared workspace's owner will then see your user ID in the box instead of the username</li>
								</ul>
							</li>
						</ul>
					</div>
				</Modal>
			</div>
		);
	}
}