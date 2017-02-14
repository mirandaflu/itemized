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
	}
	render() {
		let workspaceNodes = this.state.workspaces.map(function(workspace) {
			return (
				<WorkspaceItem key={workspace._id} data={workspace} />
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
