import React from 'react';
import { Link, withRouter } from 'react-router';

class Navbar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			workspaceName: ''
		};
	}
	loadWorkspaceName(id) {
		if (!id) return;
		feathers_app.service('workspaces').get(id)
			.then(result => { this.setState({workspaceName: result.name}); })
			.catch(console.error);
	}
	componentWillReceiveProps(nextProps) {
		this.loadWorkspaceName(nextProps.workspace);
	}
	componentDidMount() {
		this.loadWorkspaceName(this.props.workspace);
	}
	render() { return (
		<div className="navbar-container">
			<div className="navbar dark withshadow pure-menu pure-menu-horizontal">
				{
					!feathers_app.get('user') &&
					['/login','/signup'].indexOf(this.props.path) == -1 &&
						<Link to="/login" className="pure-menu-heading pure-menu-link" style={{float:'right'}}>Log in</Link>
				}
				{
					feathers_app.get('user') &&
					['/'].indexOf(this.props.path) != -1 &&
						<Link to="/logout" className="pure-menu-heading pure-menu-link" style={{float:'right'}}>Log out</Link>
				}
				<Link to="/" className="pure-menu-heading pure-menu-link">Itemized</Link>
				{this.props.workspace &&
					<Link
						to={'/workspace/'+this.props.workspace}
						style={{width:'70%', textOverflow:'ellipsis', overflow:'hidden', whiteSpace:'nowrap'}}
						className="pure-menu-heading pure-menu-link">
						{this.state.workspaceName}
					</Link>}
			</div>
		</div>
	); }
}

module.exports = withRouter(Navbar);