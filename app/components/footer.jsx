import React from 'react';
import { Link, withRouter } from 'react-router';

class Footer extends React.Component {
	render() { return (
		<div>
			{!feathers_app.get('user') && <Link to="/login">Log in</Link>}
		</div>
	); }
}

module.exports = withRouter(Footer);
