import React from 'react';

export default class TextInput extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			value: this.props.value
		};
	}
	handleChange = (event) => {
		let newValue = !this.state.value;
		this.props.onCommitChange({ target: {value: newValue }});
		this.setState({ value: newValue });
	}
	componentWillReceiveProps(nextProps) {
		this.setState({ value: nextProps.value });
	}
	render() { return (
		<input type="checkbox"
			checked={this.state.value}
			onChange={this.handleChange} />
	);}
}
