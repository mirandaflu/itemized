import React from 'react';
import Modal from 'react-modal';
import { Link, withRouter } from 'react-router';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

class WorkspaceItem extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			name: this.props.workspace.name,
			modalOpen: false
		}
	}
	configureWorkspace(event) {
		event.preventDefault();
		this.props.router.push('/workspace/'+this.props.workspace._id+'/configure');
	}
	render() {
		return (
			<div className="pure-u-1 pure-u-sm-1-3 pure-u-lg-1-4">
				<Link to={'/workspace/'+this.props.workspace._id}>
					<div className="card withshadow hovershadow">

						<button style={{marginTop:'-5.5px'}}
							className="pure-button button-small"
							onClick={this.configureWorkspace.bind(this)}>
							<i className="fa fa-edit" />
						</button>

						{this.props.workspace.name}

					</div>
				</Link>
			</div>
		);
	}
}

module.exports = withRouter(WorkspaceItem);
