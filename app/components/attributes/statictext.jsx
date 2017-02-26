import React from 'react';

export default class TextInput extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			value: this.props.value
		};
	}
	componentWillReceiveProps(nextProps) {
		this.setState({ value: nextProps.value });
	}
	render() { return (
		<span>{this.state.value}</span>
	);}
}
