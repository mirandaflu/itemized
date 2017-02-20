import React from 'react';
import { Link, withRouter } from 'react-router';

import WorkspaceItem from './workspaceitem.jsx';
import StatusText from './statustext.jsx';

class WorkspaceList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			workspacesLoaded: false,
			workspacesError: false,
			workspaces: []
		};
	}
	loadWorkspaces() {
		feathers_app.service('workspaces').find().then(result => {
			this.setState({
				workspacesLoaded: true,
				workspacesError: false,
				workspaces: result.data
			});
		}).catch(error => {
			console.error(error);
			this.setState({
				workspacesLoaded: false,
				workspacesError: true,
				workspaces: []
			});
		});
	}
	createWorkspace() {
		let name = 'New Workspace';
		feathers_app.service('workspaces').create({name:name}).then(result => {
			this.props.router.push('/workspace/' + result._id + '/configure');
		}).catch(console.error);
	}
	editWorkspace(id, patch) {
		feathers_app.service('workspaces').patch(id, patch).catch(console.error);
	}
	deleteWorkspace(workspace) {
		if (!confirm('Are you sure?')) return;
		feathers_app.service('workspaces').remove(workspace._id).catch(console.error);
	}
	handleCreatedWorkspace(workspace) {
		this.setState({ workspaces: this.state.workspaces.concat(workspace) });
	}
	handlePatchedWorkspace(workspace) {
		for (let i in this.state.workspaces) {
			if (this.state.workspaces[i]._id == workspace._id) {
				let newWorkspaces = this.state.workspaces;
				newWorkspaces[i] = Object.assign({}, workspace);
				this.setState({ workspaces: newWorkspaces });
				break;
			}
		}
	}
	handleRemovedWorkspace(workspace) {
		for (let i in this.state.workspaces) {
			if (this.state.workspaces[i]._id == workspace._id) {
				let newWorkspaces = this.state.workspaces;
				newWorkspaces.splice(i, 1)
				this.setState({ workspaces: newWorkspaces });
				break;
			}
		}
	}
	bindEventListeners() {
		this.workspaceCreatedListener = this.handleCreatedWorkspace.bind(this);
		this.workspacePatchedListener = this.handlePatchedWorkspace.bind(this);
		this.workspaceRemovedListener = this.handleRemovedWorkspace.bind(this);
		feathers_app.service('workspaces').on('created', this.workspaceCreatedListener);
		feathers_app.service('workspaces').on('patched', this.workspacePatchedListener);
		feathers_app.service('workspaces').on('removed', this.workspaceRemovedListener);
	}
	componentDidMount() {
		this.loadWorkspaces();
		this.bindEventListeners();
	}
	componentWillUnmount() {
		feathers_app.service('workspaces').removeListener('created', this.workspaceCreatedListener);
		feathers_app.service('workspaces').removeListener('patched', this.workspacePatchedListener);
		feathers_app.service('workspaces').removeListener('removed', this.workspaceRemovedListener);
	}
	render() {
		let that = this;
		let workspaceNodes = this.state.workspaces.map(function(workspace) {
			return (
				<WorkspaceItem
					key={workspace._id}
					workspace={workspace}
					onChange={that.editWorkspace.bind(that)}
					onDelete={that.deleteWorkspace.bind(that)} />
			);
		});
		return (
			<div>

				<StatusText
					loaded={this.state.workspacesLoaded}
					error={this.state.workspacesError}
					data={this.state.workspaces}
					nodatamessage='No Workspaces' />

				<div className="pure-g">
					{workspaceNodes}
					<div className="pure-u-1 pure-u-sm-1-3 pure-u-lg-1-4">
						<br />
						<button className="pure-button" onClick={this.createWorkspace.bind(this)}>
							Create Workspace
						</button>
					</div>
				</div>

			</div>
		);
	}
}

module.exports = withRouter(WorkspaceList);
