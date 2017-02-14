import React from 'react';
import { Link, withRouter } from 'react-router';

class Workspace extends React.Component {
	render() {
		return (
			<Link to={'/workspace/'+this.props.data._id} className="pure-u-1 pure-u-sm-1-3">
				{this.props.data.name}
			</Link>
		);
	}
}

module.exports = withRouter(Workspace);
