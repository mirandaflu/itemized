import React from 'react';
import { Link, withRouter } from 'react-router';

class Logout extends React.Component {
	render() { return (
		<div>
			Logged out
			<br />
			<Link to="/login">Log in</Link>
		</div>
	); }
}

module.exports = withRouter(Logout);
