import React from 'react';

export default class StatusText extends React.Component {
	render() { return (
		<span>
			{!this.props.loaded && !this.props.error &&
				'Loading...'}
			{this.props.loaded && this.props.data.length == 0 &&
				this.props.nodatamessage}
			{this.props.error &&
				'Error'}
		</span>
	); }
}
