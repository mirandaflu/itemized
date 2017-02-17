import React from 'react';

export default class Cell extends React.Component {
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
			onChange={this.handleChange.bind(this)}
			onFocus={this.props.onFocus}
			onKeyDown={this.props.onKeyDown}
			onBlur={this.props.onBlur} />
	);}
}
