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
	loadWorkspaces = () => {
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
	createWorkspace = () => {
		let name = 'New Workspace';
		feathers_app.service('workspaces').create({name:name}).then(result => {
			this.props.router.push('/workspace/' + result._id + '/configure');
		}).catch(console.error);
	}
	editWorkspace = (id, patch) => {
		feathers_app.service('workspaces').patch(id, patch).catch(console.error);
	}
	deleteWorkspace = (workspace) => {
		if (!confirm('Are you sure?')) return;
		feathers_app.service('workspaces').remove(workspace._id).catch(console.error);
	}
	handleCreatedWorkspace = (workspace) => {
		this.setState({ workspaces: this.state.workspaces.concat(workspace) });
	}
	handlePatchedWorkspace = (workspace) => {
		for (let i in this.state.workspaces) {
			if (this.state.workspaces[i]._id == workspace._id) {
				let newWorkspaces = this.state.workspaces;
				newWorkspaces[i] = Object.assign({}, workspace);
				this.setState({ workspaces: newWorkspaces });
				break;
			}
		}
	}
	handleRemovedWorkspace = (workspace) => {
		for (let i in this.state.workspaces) {
			if (this.state.workspaces[i]._id == workspace._id) {
				let newWorkspaces = this.state.workspaces;
				newWorkspaces.splice(i, 1)
				this.setState({ workspaces: newWorkspaces });
				break;
			}
		}
	}
	componentDidMount() {
		this.loadWorkspaces();
		feathers_app.service('workspaces').on('created', this.handleCreatedWorkspace);
		feathers_app.service('workspaces').on('patched', this.handlePatchedWorkspace);
		feathers_app.service('workspaces').on('removed', this.handleRemovedWorkspace);
	}
	componentWillUnmount() {
		feathers_app.service('workspaces').removeListener('created', this.handleCreatedWorkspace);
		feathers_app.service('workspaces').removeListener('patched', this.handlePatchedWorkspace);
		feathers_app.service('workspaces').removeListener('removed', this.handleRemovedWorkspace);
	}
	render() {
		let that = this;
		let userID = feathers_app.get('user')._id;
		let yourWorkspaceNodes = [],
			editWorkspaceNodes = [],
			viewWorkspaceNodes = [];
		for (let workspace of this.state.workspaces) {
			if (workspace.owner == userID || workspace.admins.indexOf(userID) != -1) {
				yourWorkspaceNodes.push( (
					<WorkspaceItem
						key={workspace._id}
						workspace={workspace}
						onChange={that.editWorkspace}
						onDelete={that.deleteWorkspace} />
				) );
			}
			else if (workspace.editors.indexOf(userID) != -1) {
				editWorkspaceNodes.push( (
					<WorkspaceItem
						key={workspace._id}
						workspace={workspace}
						onChange={that.editWorkspace}
						onDelete={that.deleteWorkspace} />
				) );
			}
			else if (workspace.viewers.indexOf(userID) != -1) {
				viewWorkspaceNodes.push( (
					<WorkspaceItem
						key={workspace._id}
						workspace={workspace}
						readOnly={true}
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
					nodatamessage='No Workspaces' />
				
				<h3>Your workspaces</h3>
				<div className="pure-g">
					{yourWorkspaceNodes}
					<div className="pure-u-1" style={{margin:'15px', textAlign:'center'}}>
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
