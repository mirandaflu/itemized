import React from 'react';

export default class TextInput extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			value: this.props.value
		};
	}
	handleChange(e) {
		this.setState({ value: e.target.value });
	}
	componentWillReceiveProps(nextProps) {
		this.setState({ value: nextProps.value });
	}
	render() { return (
		<input type="text"
			value={this.state.value}
			onFocus={this.props.onEditStart}
			onChange={this.handleChange.bind(this)}
			onBlur={this.props.onCommitChange} />
	);}
}
