import React from 'react';

export default class TextInput extends React.Component {
	state = { value: this.props.value || '' }
	handleChange = (event) => this.setState({ value: event.target.value });
	componentWillReceiveProps(nextProps) {
		this.setState({ value: nextProps.value });
	}
	render() {
		return (
			<input type="text"
				value={this.state.value}
				onChange={this.handleChange}
				onBlur={this.props.onCommitChange} />
		);
	}
}
