import React from 'react';
import { withRouter } from 'react-router';

import WorkspaceItem from 'components/workspaceitem';
import StatusText from 'components/statustext';

class WorkspaceList extends React.Component {
	state = {
		workspacesLoaded: false,
		workspacesError: false,
		workspaces: []
	}
	loadWorkspaces = () => {
		feathersApp.service('workspaces').find().then(result => {
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
	createWorkspace = () => {
		const name = 'New Workspace';
		feathersApp.service('workspaces').create({name: name}).then(result => {
			this.props.router.push('/workspace/' + result._id + '/configure');
		}).catch(console.error);
	}
	editWorkspace = (id, patch) => {
		feathersApp.service('workspaces').patch(id, patch).catch(console.error);
	}
	deleteWorkspace = (workspace) => {
		if (!confirm('Are you sure?')) return;
		feathersApp.service('workspaces').remove(workspace._id).catch(console.error);
	}
	handleCreatedWorkspace = (workspace) => {
		this.setState({ workspaces: this.state.workspaces.concat(workspace) });
	}
	handlePatchedWorkspace = (workspace) => {
		for (const i in this.state.workspaces) {
			if (this.state.workspaces[i]._id === workspace._id) {
				const newWorkspaces = this.state.workspaces;
				newWorkspaces[i] = Object.assign({}, workspace);
				this.setState({ workspaces: newWorkspaces });
				break;
			}
		}
	}
	handleRemovedWorkspace = (workspace) => {
		for (const i in this.state.workspaces) {
			if (this.state.workspaces[i]._id === workspace._id) {
				const newWorkspaces = this.state.workspaces;
				newWorkspaces.splice(i, 1);
				this.setState({ workspaces: newWorkspaces });
				break;
			}
		}
	}
	componentDidMount() {
		this.loadWorkspaces();
		feathersApp.service('workspaces').on('created', this.handleCreatedWorkspace);
		feathersApp.service('workspaces').on('patched', this.handlePatchedWorkspace);
		feathersApp.service('workspaces').on('removed', this.handleRemovedWorkspace);
	}
	componentWillUnmount() {
		feathersApp.service('workspaces').removeListener('created', this.handleCreatedWorkspace);
		feathersApp.service('workspaces').removeListener('patched', this.handlePatchedWorkspace);
		feathersApp.service('workspaces').removeListener('removed', this.handleRemovedWorkspace);
	}
	render() {
		const that = this;
		const userID = feathersApp.get('user')._id;
		const yourWorkspaceNodes = [];
		const editWorkspaceNodes = [];
		const viewWorkspaceNodes = [];

		for (const workspace of this.state.workspaces) {
			if (workspace.owner === userID || workspace.admins.indexOf(userID) !== -1) {
				yourWorkspaceNodes.push( (
					<WorkspaceItem
						key={workspace._id}
						workspace={workspace}
						onChange={that.editWorkspace}
						onDelete={that.deleteWorkspace} />
				) );
			} else if (workspace.editors.indexOf(userID) !== -1) {
				editWorkspaceNodes.push( (
					<WorkspaceItem
						key={workspace._id}
						workspace={workspace}
						onChange={that.editWorkspace}
						onDelete={that.deleteWorkspace} />
				) );
			} else if (workspace.viewers.indexOf(userID) !== -1) {
				viewWorkspaceNodes.push( (
					<WorkspaceItem
						readOnly
						key={workspace._id}
						workspace={workspace}
						onChange={that.editWorkspace}
						onDelete={that.deleteWorkspace} />
				) );
			}
		}
		return (
			<div>
				<StatusText
					loaded={this.state.workspacesLoaded}
					error={this.state.workspacesError}
					data={this.state.workspaces}
					nodatamessage="No Workspaces" />

				<h3>Your workspaces</h3>
				<div className="pure-g">
					{yourWorkspaceNodes}
					<div className="pure-u-1" style={{margin: '15px', textAlign: 'center'}}>
						<button className="pure-button button-secondary" onClick={this.createWorkspace}>
							<i className="fa fa-plus" />&nbsp;&nbsp;&nbsp;Create Workspace
						</button>
					</div>
				</div>

				{editWorkspaceNodes.length > 0 &&
					<div>
						<h4>Workspaces you can edit</h4>
						<div className="pure-g">
							{editWorkspaceNodes}
						</div>
					</div>
				}

				{viewWorkspaceNodes.length > 0 &&
					<div>
						<h4>Workspaces you can view</h4>
						<div className="pure-g">
							{viewWorkspaceNodes}
						</div>
					</div>
				}

			</div>
		);
	}
}

module.exports = withRouter(WorkspaceList);
