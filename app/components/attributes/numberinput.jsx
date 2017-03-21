import React from 'react';

export default class NumberInput extends React.Component {
	state = { value: this.props.value }
	handleChange = (event) => this.setState({ value: event.target.value });
	componentWillReceiveProps(nextProps) {
		this.setState({ value: nextProps.value });
	}
	render() { return (
		<input type="number"
			value={this.state.value}
			onChange={this.handleChange}
			onBlur={this.props.onCommitChange} />
	);}
}
