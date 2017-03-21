import React from 'react';
import { Link, withRouter } from 'react-router';

class Logout extends React.Component {
	render() {
		return (
			<div>
				Logged out
			</div>
		);
	}
}

module.exports = withRouter(Logout);
