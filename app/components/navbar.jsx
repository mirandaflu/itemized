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
				<Link to="/" className="pure-menu-heading pure-menu-link"><i className="fa fa-bars" /></Link>
				<Link to="/" className="pure-menu-heading pure-menu-link" style={{textTransform:'none'}}>Itemized</Link>
				{this.props.workspace && <span className="pure-menu-heading pure-menu-link" style={{textTransform:'none'}}>{this.state.workspaceName}</span>}
			</div>
		</div>
	); }
}

module.exports = withRouter(Navbar);