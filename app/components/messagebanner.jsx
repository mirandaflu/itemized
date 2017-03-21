import React from 'react';

class Banner extends React.Component {
	componentDidMount() {
		this.refs.banner.className = "alert animated shake";
	}
	componentWillUnmount() {
		this.refs.banner.className = "alert";
	}
	render() {
		return (
			<div ref="banner" className="alert">
				<button type="button" className="pure-button" onClick={this.props.closeClick}>x</button>
				<p>
					{this.props.text}
				</p>
			</div>
		);
	}
}

export default class MessageBanner extends React.Component {
	state = { messageText: null }
	clearMessage = () => this.setState({messageText:null});
	showMessage = (message) => this.setState({messageText:message});
	render() {
		return (
			<div className="messagebanner">
				{this.state.messageText && <Banner text={this.state.messageText} closeClick={this.clearMessage} />}
			</div>
		);
	}
}
