import React from 'react';
import { Link, withRouter } from 'react-router';

import Workspace from './workspace.jsx';

class WorkspaceList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			workspacesLoaded: false,
			workspacesError: false,
			workspaces: []
		};
	}
	componentDidMount() {
		this.loadWorkspaces();
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
		console.log(name);
	}
	render() {
		let workspaceNodes = this.state.workspaces.map(function(workspace) {
			return (
				<Workspace key={workspace._id} data={workspace} />
			);
		});
		return (
			<div>

				{!this.state.workspacesLoaded && !this.state.workspacesError &&
					'Loading...'}
				{this.state.workspacesLoaded && this.state.workspaces.length == 0 &&
					'No workspaces'}
				{this.state.workspacesError &&
					'Error'}

				<div className="pure-g">
					{workspaceNodes}
				</div>

				<button onClick={this.createWorkspace.bind(this)}>Create</button>

			</div>
		);
	}
}

module.exports = withRouter(WorkspaceList);
