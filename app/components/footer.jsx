import React from 'react';
import { Link, withRouter } from 'react-router';

class Footer extends React.Component {
	render() { return (
		<div>
			{
				!feathers_app.get('user') &&
				['/login','/signup'].indexOf(this.props.path) == -1 &&
					<Link to="/login">Log in</Link>
			}
			{
				feathers_app.get('user') &&
				['/'].indexOf(this.props.path) != -1 &&
					<Link to="/logout">Log out</Link>
			}
		</div>
	); }
}

module.exports = withRouter(Footer);
