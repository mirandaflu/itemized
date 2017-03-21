import React from 'react';
import Navbar from './navbar.jsx';

export default class Skeleton extends React.Component {
	componentWillUpdate() {
		window.scrollTo(0, 0);
	}
	render() {
		return (
			<div>
				<Navbar workspace={this.props.params.workspace} path={this.props.location.pathname} />
				{this.props.children}
			</div>
		);
	}
}
