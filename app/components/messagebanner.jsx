import React from 'react';

export default class MessageBanner extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			messageText: null
		};
	}
	clearMessage() { this.setState({messageText:null}); }
	showMessage(message) {
		this.clearMessage();
		this.setState({messageText:message});
	}
	render() {
		return (
			<div>
				{this.state.messageText &&
					<div className="alert alert-info animated fadeIn">
						<button type="button" onClick={this.clearMessage.bind(this)}>x</button>
						{this.state.messageText}
					</div>
				}
			</div>
		);
	}
}
