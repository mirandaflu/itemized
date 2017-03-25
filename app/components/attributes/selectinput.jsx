import React from 'react';
import Select from 'react-select';

export default class SelectInput extends React.Component {
	state = {
		value: this.props.value,
		options: []
	}
	loadOptions = () => {
		feathersApp.service('fields').get(this.props.field).then(field1 => {
			feathersApp.service('fields').get(field1.fieldReference).then(field => {
				feathersApp.service('attributes').find({query: {
					coll: field.coll,
					field: field.fieldReference
				}}).then(attributes => {
					this.setState({ options: attributes.map(attribute => {
						return {
							label: attribute.value,
							value: attribute.value
						};
					}) });
				}).catch(console.error);
			}).catch(console.error);
		}).catch(console.error);
	}
	handleChange = (value) => {
		if (this.props.clearable && value === null) {
			this.props.onCommitChange({ target: {value: null} });
			this.setState({ value: null });
		} else if (this.props.fieldType.indexOf('Single') !== -1) {
			if (this.props.options.indexOf(value.value) === -1) {
				this.props.onCreateOption(value.value);
			}
			this.props.onCommitChange({ target: {value: value.value} });
			this.setState({ value: value.value });
		} else if (this.props.fieldType.indexOf('Multiple') !== -1) {
			const valueArray = [];
			for (const v of value) {
				if (this.props.options.indexOf(v.value) === -1) {
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
	componentDidMount() {
		if (this.props.fieldType.indexOf('Reference') !== -1) {
			this.loadOptions();
		}
	}
	render() {
		let options = [];
		if (this.props.fieldType.indexOf('Reference') !== -1) {
			options = this.state.options;
		} else {
			for (const o of this.props.options) {
				options = options.concat({'value': o, 'label': o});
			}
		}
		const Component = (this.props.fieldType.indexOf('Reference') !== -1) ? Select : Select.Creatable;
		return (
			<Component
				placeholder=""
				value={this.state.value}
				options={options}
				multi={this.props.fieldType.indexOf('Multiple') !== -1}
				clearable={this.props.clearable || false}
				onChange={this.handleChange} />
		);
	}
}
