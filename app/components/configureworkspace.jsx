import React from 'react';
import Modal from 'react-modal';
import { Link, withRouter } from 'react-router';

import UserSelect from './userselect.jsx';
import MessageBanner from './messagebanner.jsx';

class ConfigureWorkspace extends React.Component {
	state = {
		name: null,
		workspace: {
			admins: [],
			editors: [],
			viewers: []
		},
		usernameIndex: {}
	}
	loadWorkspace = () => {
		feathersApp.service('workspaces').get(this.props.params.workspace)
			.then(result => { this.setState({ workspace: result, name: result.name }); })
			.catch(console.error);
	}
	indexUsernames = () => {
		feathersApp.service('users').find({query: {username: {$exists: true}}})
			.then(result => {
				const index = {};
				for (const user of result.data) {
					index[user._id] = user.username;
				}
				this.setState({ usernameIndex: index });
			});
	}
	userToOption = (id) => {
		return {
			label: this.state.usernameIndex[id] || id,
			value: id
		};
	}
	handleNameChange = (event) => {
		this.setState({ name: event.target.value });
	}
	commitNameChange = () => {
		if (this.state.name === '') this.refs.messageBanner.showMessage('Name cannot be blank');
		else feathersApp.service('workspaces').patch(this.props.params.workspace, {name: this.state.name}).catch(console.error);
	}
	handleSelectChange = (role, options) => {
		const patch = {};
		patch[role] = options.map(option => { return option.value; });
		feathersApp.service('workspaces').patch(this.state.workspace._id, patch).catch(console.error);
	}
	returnToWorkspace = (event) => {
		event.preventDefault();
		this.commitNameChange();
		this.props.router.push('/workspace/' + this.props.params.workspace);
	}
	handleDeleteClick = () => {
		if (!confirm('Are you sure?')) return;
		feathersApp.service('workspaces').remove(this.state.workspace._id).then(result => {
			this.props.router.push('/');
		});
	}
	handlePatchedWorkspace = (workspace) => {
		if (workspace._id === this.state.workspace._id) {
			this.setState({ workspace: workspace, name: workspace.name });
		}
	}
	componentDidMount() {
		this.loadWorkspace();
		this.indexUsernames();
		feathersApp.service('workspaces').on('patched', this.handlePatchedWorkspace);
	}
	componentWillUnmount() {
		feathersApp.service('workspaces').removeListener('patched', this.handlePatchedWorkspace);
	}
	render() {
		const that = this;
		return (
			<div className="workspace">
				<Modal contentLabel="configureworkspace" isOpen>
					<div className="modalContent">
						<MessageBanner ref="messageBanner" />
						<button className="pure-button button-small" onClick={this.returnToWorkspace}>
							<i className="fa fa-close" />
						</button>
						<form onSubmit={this.returnToWorkspace} className="pure-form pure-form-aligned">
							<fieldset>
								<div className="pure-control-group">
									<label htmlFor="name">Workspace Name</label>
									<input id="name" type="text"
										ref="nameInput"
										value={this.state.name}
										onChange={this.handleNameChange}
										onBlur={this.commitNameChange} />
								</div>
							</fieldset>
							<div className="pure-controls">
								<button className="pure-button button-error"
									onClick={this.handleDeleteClick}>
									Delete Workspace
								</button>
							</div>
						</form>

						<form onSubmit={e => {e.preventDefault();}} className="pure-form pure-form-aligned">
							<legend>Sharing</legend>
							<fieldset>
								<div className="pure-control-group">
									<label>Owner:</label>
									<input disabled value={this.state.usernameIndex[this.state.workspace.owner] || this.state.workspace.owner} />
								</div>
								<div className="pure-control-group">
									<label>Admins:</label>
									<UserSelect
										multi
										value={this.state.workspace.admins &&
											this.state.workspace.admins.map(this.userToOption)}
										onChange={this.handleSelectChange.bind(this, 'admins')} />
								</div>
								<div className="pure-control-group">
									<label>Editors:</label>
									<UserSelect
										multi
										value={this.state.workspace.editors &&
											this.state.workspace.editors.map(this.userToOption)}
										onChange={this.handleSelectChange.bind(this, 'editors')} />
								</div>
								<div className="pure-control-group">
									<label>Viewers:</label>
									<UserSelect
										multi
										value={this.state.workspace.viewers &&
											this.state.workspace.viewers.map(this.userToOption)}
										onChange={this.handleSelectChange.bind(this, 'viewers')} />
								</div>
							</fieldset>
						</form>

						<br />
						Choose Template:
						<br /><br />
						<Link ref="empty" className="card withshadow hovershadow" to={'/workspace/' + this.props.params.workspace}>Empty Workspace</Link>
					</div>
				</Modal>
			</div>
		);
	}
}

module.exports = withRouter(ConfigureWorkspace);
