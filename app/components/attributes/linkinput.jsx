import React from 'react';

export default class LinkInput extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			value: this.props.value,
			editVisible: false
		};
	}
	toggleEditMode = () => this.setState({ editVisible: !this.state.editVisible });
	handleEditStart = (event) => this.setState({ editVisible: true });
	handleKeyDown = (event) => {
		if (event.key === 'Enter') {
			this.handleCommitChange(event);
		}
	}
	handleChange = (event) => this.setState({ value: event.target.value });
	handleCommitChange = (event) => {
		this.props.onCommitChange(event);
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
							onClick={this.toggleEditMode}>
							<i className="fa fa-pencil" />
						</button>
					</div>
				}
				{(this.state.editVisible || this.state.value == '') &&
					<input type="text"
						value={this.state.value}
						onFocus={this.handleEditStart}
						onKeyDown={this.handleKeyDown}
						onChange={this.handleChange}
						onBlur={this.handleCommitChange} />
				}
			</div>
		);
	}
}
