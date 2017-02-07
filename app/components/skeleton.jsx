import React from 'react';

// import Navbar from './navbar';
// import Footer from './footer';

export default class Skeleton extends React.Component {
	componentWillUpdate() {
		window.scrollTo(0, 0);
	}
	render() { return (
		<div>
			<div></div>
			{this.props.children}
			<div></div>
		</div>
	); }
}