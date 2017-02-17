import React from 'react';

export default class TextInput extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			value: this.props.value
		};
	}
	handleChange(e) {
		this.props.onCommitChange(e);
		this.setState({ value: e.target.value });
	}
	componentWillReceiveProps(nextProps) {
		this.setState({ value: nextProps.value });
	}
	render() {
		let i = 0, that = this;
		return (
			<select value={this.state.value} onChange={this.handleChange.bind(this)}>
				<option></option>
				{this.props.options.map(function(option) { i++; return (
					<option key={i}>{option}</option>
				);})}
			</select>
		);
	}
}
