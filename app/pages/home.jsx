import React from 'react';
import { Link, withRouter } from 'react-router';

// import Navbar from './navbar';
// import Footer from './footer';

class Home extends React.Component {
	render() { return (
		<div>
			Home
			<br />
			<Link to="/logout">Log out</Link>
		</div>
	); }
}

module.exports = withRouter(Home);
