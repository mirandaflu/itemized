import React from 'react';
import { withRouter } from 'react-router';

import WorkspaceList from 'components/workspacelist';

class Home extends React.Component {
	componentDidMount() {
		document.title = 'Itemized';
	}
	render() {
		return (
			<div>
				<div className="pure-g">
					<div className="pure-u-1 pure-u-sm-1-24 pure-u-md-1-8 pure-u-xl-1-6" />
					<div className="pure-u-1 pure-u-sm-11-12 pure-u-md-3-4 pure-u-xl-2-3">
						<WorkspaceList />
					</div>
					<div className="pure-u-1 pure-u-sm-1-24 pure-u-md-1-8 pure-u-xl-1-6" />
				</div>
			</div>
		);
	}
}

module.exports = withRouter(Home);
