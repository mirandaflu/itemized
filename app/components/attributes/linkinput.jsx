import React from 'react';

export default class LinkInput extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			value: this.props.value,
			editVisible: false
		};
	}
	toggleEditMode() {
		this.setState({ editVisible: !this.state.editVisible });
	}
	handleEditStart(e) {
		this.setState({ editVisible: true });
	}
	handleKeyDown(e) {
		if (e.key === 'Enter') {
			this.handleCommitChange(e);
		}
	}
	handleChange(e) {
		this.setState({ value: e.target.value });
	}
	handleCommitChange(e) {
		this.props.onCommitChange(e);
		this.setState({ editVisible: false });
	}
	componentWillReceiveProps(nextProps) {
		this.setState({ value: nextProps.value });
	}
	render() {
		let actualLink = this.state.value;
		if (actualLink != '' && actualLink != null) {
			if (this.props.fieldType == 'URL' && actualLink.slice(0,4) != 'http') {
				actualLink = 'http://'+actualLink;
			}
			if (this.props.fieldType == 'Email Address' && actualLink.slice(0,6) != 'mailto') {
				actualLink = 'mailto:'+actualLink;
			}
		}
		return (
			<div>
				{(!this.state.editVisible && this.state.value != '') &&
					<div>
						<a target="_blank" href={actualLink}>{this.state.value}</a>
						<button className="pure-button button-xsmall"
							onClick={this.toggleEditMode.bind(this)}>
							<i className="fa fa-pencil" />
						</button>
					</div>
				}
				{(this.state.editVisible || this.state.value == '') &&
					<input type="text"
						value={this.state.value}
						onFocus={this.handleEditStart.bind(this)}
						onKeyDown={this.handleKeyDown.bind(this)}
						onChange={this.handleChange.bind(this)}
						onBlur={this.handleCommitChange.bind(this)} />
				}
			</div>
		);
	}
}
