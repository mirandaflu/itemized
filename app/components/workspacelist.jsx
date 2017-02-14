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
		let name = prompt('Name?');
		feathers_app.service('workspaces').create({name:name}).then(result => {
			this.setState({
				workspaces: this.state.workspaces.concat(result)
			});
		}).catch(error => {
			console.error(error);
			this.setState({
				workspacesError: true
			});
		});
	}
	deleteWorkspace(e, data) {
		if (!confirm('Are you sure?')) return;
		feathers_app.service('workspaces').remove(data.deleteID).then(result => {
			for (let i in this.state.workspaces) {
				if (this.state.workspaces[i]._id == data.deleteID) {
					let newWorkspaces = this.state.workspaces;
					newWorkspaces.splice(i, 1)
					this.setState({ workspaces: newWorkspaces });
					break;
				}
			}
		});
	}
	componentDidMount() {
		this.loadWorkspaces();
	}
	render() {
		let that = this;
		let workspaceNodes = this.state.workspaces.map(function(workspace) {
			return (
				<WorkspaceItem
					key={workspace._id}
					data={workspace}
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
				</div>

				<button onClick={this.createWorkspace.bind(this)}>Create Workspace</button>

			</div>
		);
	}
}

module.exports = withRouter(WorkspaceList);
