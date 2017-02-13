import React from 'react';

import Footer from '../components/footer.jsx';

export default class Skeleton extends React.Component {
	componentWillUpdate() {
		window.scrollTo(0, 0);
	}
	render() { return (
		<div>
			<div></div>
			{this.props.children}
			<Footer />
		</div>
	); }
}
