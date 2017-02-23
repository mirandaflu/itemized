import React from 'react';

import Navbar from './navbar.jsx';
import Footer from './footer.jsx';

export default class Skeleton extends React.Component {
	componentWillUpdate() {
		window.scrollTo(0, 0);
	}
	render() { return (
		<div>
			<Navbar workspace={this.props.params.workspace} />
			{this.props.children}
			<Footer path={this.props.location.pathname} />
		</div>
	); }
}
