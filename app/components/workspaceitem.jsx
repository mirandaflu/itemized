import React from 'react';
import { Link, withRouter } from 'react-router';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

class Workspace extends React.Component {
	render() {
		return (
			<div className="pure-u-1 pure-u-sm-1-3">
				<ContextMenuTrigger id={'workspace'+this.props.data._id}>
					<Link to={'/workspace/'+this.props.data._id}>
						{this.props.data.name}
					</Link>
				</ContextMenuTrigger>
				<ContextMenu id={'workspace'+this.props.data._id}>
					<MenuItem data={{deleteID: this.props.data._id}} onClick={this.props.onDelete}>
						Delete Workspace
					</MenuItem>
				</ContextMenu>
			</div>
		);
	}
}

module.exports = withRouter(Workspace);
