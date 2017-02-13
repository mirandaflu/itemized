import React from 'react';
import { Link, withRouter } from 'react-router';

import WorkspaceList from '../components/workspacelist.jsx';

class Home extends React.Component {
	render() { return (
		<div>
			<WorkspaceList />
		</div>
	); }
}

module.exports = withRouter(Home);
