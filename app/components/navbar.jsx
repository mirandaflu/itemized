import React from 'react';
import { Link } from 'react-router';

export default class Navbar extends React.Component {
	state = {
		workspaceName: '',
		workspace: {}
	}
	loadWorkspaceName = (id) => {
		if (!id) return;
		feathersApp.service('workspaces').get(id)
			.then(result => { this.setState({workspaceName: result.name, workspace: result}); })
			.catch(console.error);
	}
	handlePatchedWorkspace = (workspace) => {
		if (workspace._id === this.props.workspace) {
			this.setState({ workspaceName: workspace.name });
		}
	}
	componentWillReceiveProps(nextProps) {
		this.loadWorkspaceName(nextProps.workspace);
	}
	componentDidMount() {
		this.loadWorkspaceName(this.props.workspace);
		feathersApp.service('workspaces').on('patched', this.handlePatchedWorkspace);
	}
	componentWillUnmount() {
		feathersApp.service('workspaces').removeListener('patched', this.handlePatchedWorkspace);
	}
	render() {
		const user = feathersApp.get('user');
		return (
			<div className="navbar-container">
				<div className="navbar dark withshadow pure-menu pure-menu-horizontal">
					{!user && ['/login', '/signup'].indexOf(this.props.path) === -1 &&
						<Link to="/login" className="pure-menu-heading pure-menu-link" style={{float: 'right'}}>Log in</Link>
					}
					{user &&
						<Link to="/account" className="pure-menu-heading pure-menu-link" style={{float: 'right'}}>
							{user.username} <i className="fa fa-user" />
						</Link>
					}
					<Link to="/" className="pure-menu-heading pure-menu-link">Itemized</Link>
					{this.props.workspace &&
						<Link
							to={'/workspace/' + this.props.workspace}
							className="pure-menu-heading pure-menu-link">
							{this.state.workspaceName}
						</Link>
					}
					{this.props.workspace && this.state.workspace.viewers && this.state.workspace.viewers.indexOf(feathersApp.get('user')._id) === -1 &&
						<Link
							to={'/workspace/' + this.props.workspace + '/configure'}
							className="pure-menu-heading pure-menu-link">
							<i className="fa fa-pencil" />
						</Link>
					}
				</div>
			</div>
		);
	}
}
