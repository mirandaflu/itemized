import React from 'react';
import Select from 'react-select';

export default class SelectInput extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			value: this.props.value
		};
	}
	handleChange(value) {
		if (this.props.fieldType == 'Single Select') {
			if (this.props.options.indexOf(value.value) == -1) {
				this.props.onCreateOption(value.value);
			}
			this.props.onCommitChange({ target: {value: value.value} });
			this.setState({ value: value.value });
		}
		else if (this.props.fieldType == 'Multiple Select') {
			let valueArray = [];
			for (let v of value) {
				if (this.props.options.indexOf(v.value) == -1) {
					this.props.onCreateOption(v.value);
				}
				valueArray.push(v.value);
			}
			this.props.onCommitChange({ target: {value: valueArray} });
			this.setState({ value: valueArray });
		}
	}
	componentWillReceiveProps(nextProps) {
		this.setState({ value: nextProps.value });
	}
	render() {
		let i = 0, that = this;
		let options = [];
		for (let o of this.props.options) {
			options = options.concat({'value':o, 'label':o});
		}
		return (
			<Select.Creatable
				value={this.state.value}
				options={options}
				multi={this.props.fieldType == 'Multiple Select'}
				onChange={this.handleChange.bind(this)} />
		);
	}
}
