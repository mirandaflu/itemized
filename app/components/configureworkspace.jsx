import React from 'react';
import Modal from 'react-modal';
import Select from 'react-select';
import { Link, withRouter } from 'react-router';

import UserSelect from './userselect.jsx';

class ConfigureWorkspace extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			workspace: {
				admins: [],
				editors: [],
				viewers: []
			},
			usernameIndex: {}
		};
	}
	loadWorkspace() {
		feathers_app.service('workspaces').get(this.props.params.workspace)
			.then(result => { this.setState({ workspace: result }); })
			.catch(console.error);
	}
	indexUsernames() {
		feathers_app.service('users').find({query:{username:{$exists:true}}})
			.then(result => {
				let index = {};
				for (let user of result.data) {
					index[user._id] = user.username;
				}
				this.setState({ usernameIndex: index });
			});
	}
	userToOption(id) {
		return {
			label: this.state.usernameIndex[id] || id,
			value: id
		};
	} 
	handleNameChange(event) {
		let name = event.target.value;
		this.setState({ name:name });
		feathers_app.service('workspaces').patch(this.props.params.workspace, {name:name}).catch(console.error);
	}
	handleSelectChange(role, options) {
		let patch = {};
		patch[role] = options.map(function(option) { return option.value; });
		feathers_app.service('workspaces').patch(this.state.workspace._id, patch).catch(console.error);
	}
	handleSubmit(event) {
		event.preventDefault();
		this.props.router.push('/workspace/' + this.props.params.workspace);
	}
	handleDeleteClick() {
		if (!confirm('Are you sure?')) return;
		feathers_app.service('workspaces').remove(this.state.workspace._id).then(result => {
			this.props.router.push('/');
		});
	}
	handlePatchedWorkspace(workspace) {
		if (workspace._id == this.state.workspace._id) {
			this.setState({ workspace: workspace });
		}
	}
	returnToWorkspace() {
		this.props.router.push('/workspace/' + this.props.params.workspace);
	}
	componentDidMount() {
		this.loadWorkspace();
		this.indexUsernames();
		this.workspacePatchedListener = this.handlePatchedWorkspace.bind(this);
		feathers_app.service('workspaces').on('patched', this.workspacePatchedListener);
	}
	componentWillUnmount() {
		feathers_app.service('workspaces').removeListener('patched', this.workspacePatchedListener);
	}
	render() {
		let that = this;
		return(
			<div className="workspace">
				<Modal contentLabel="configureworkspace" isOpen={true}>
					<div className="modalContent">
						<button className="pure-button button-small" onClick={this.returnToWorkspace.bind(this)}>
							<i className="fa fa-close" />
						</button>
						<form onSubmit={this.handleSubmit.bind(this)} className="pure-form pure-form-aligned">
							<fieldset>
								<div className="pure-control-group">
									<label htmlFor="name">Workspace Name</label>
									<input id="name" type="text"
										ref="nameInput"
										value={this.state.workspace.name}
										onChange={this.handleNameChange.bind(this)} />
								</div>
							</fieldset>
							<div className="pure-controls">
								<button className="pure-button button-error"
									onClick={this.handleDeleteClick.bind(this)}>
									Delete Workspace
								</button>
							</div>
						</form>

						<form onSubmit={function(e){e.preventDefault();}} className="pure-form pure-form-aligned">
							<legend>Sharing</legend>
							<fieldset>
								<div className="pure-control-group">
									<label>Owner:</label>
									<input disabled value={this.state.usernameIndex[this.state.workspace.owner] || this.state.workspace.owner} />
								</div>
								<div className="pure-control-group">
									<label>Admins:</label>
									<UserSelect
										multi={true}
										value={this.state.workspace.admins &&
											this.state.workspace.admins.map(this.userToOption.bind(this))}
										onChange={this.handleSelectChange.bind(this, 'admins')} />
								</div>
								<div className="pure-control-group">
									<label>Editors:</label>
									<UserSelect
										multi={true}
										value={this.state.workspace.editors &&
											this.state.workspace.editors.map(this.userToOption.bind(this))}
										onChange={this.handleSelectChange.bind(this, 'editors')} />
								</div>
								<div className="pure-control-group">
									<label>Viewers:</label>
									<UserSelect
										multi={true}
										value={this.state.workspace.viewers && 
											this.state.workspace.viewers.map(this.userToOption.bind(this))}
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