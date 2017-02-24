import React from 'react';
import Modal from 'react-modal';
import Select from 'react-select';

class FilterRow extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			operatorOptions: [
				{
					label: 'equals',
					value: '=='
				}, {
					label: 'does not equal',
					value: '!='
				}, {
					label: 'is greater than',
					value: '>'
				}, {
					label: 'is less than',
					value: '<'
				}, {
					label: 'is set',
					value: '!== null',
					noValue: true
				}, {
					label: 'is not set',
					value: '=== null',
					noValue: true
				}
			],
			field: this.props.field || null,
			operator: this.props.operator || { label: 'equals', value: '==' },
			value: this.props.value || null
		}
	}
	handleSelectChange(type, value) {
		let s = {};
		s[type] = value;
		console.log(s);
		this.setState(s);
	}
	render() {
		let that = this;
		let valueOptions = this.props.attributes.filter(function(attribute) {
			if (!that.state.field) return false;
			else return attribute.field == that.state.field.value;
		}).map(function(attribute) { return attribute.value; });
		valueOptions = [ ...new Set(valueOptions)]; // remove duplicates
		valueOptions = valueOptions.map(function(attribute) {
			return { value: attribute, label: attribute };
		});
		return (
			<div style={{marginBottom:'10px'}}>
				<Select
					clearable={false}
					value={this.state.field}
					onChange={this.handleSelectChange.bind(this, 'field')}
					options={this.props.fields.map(function(field){ return { value: field._id, label: field.name }; })} />
				<Select
					clearable={false}
					value={this.state.operator}
					onChange={this.handleSelectChange.bind(this, 'operator')}
					options={this.state.operatorOptions} />
				{!this.state.operator.noValue && <Select
					value={this.state.value}
					onChange={this.handleSelectChange.bind(this, 'value')}
					options={valueOptions} />}
			</div>
		);
	}
}

export default class FilterMaker extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			modalOpen: false,
			filters: [],
			defaultFilter: {
				field: null,
				operator: null,
				value: null
			}
		};
	}
	handleSelectChange(type, value) {
		let s = {};
		s[type] = value;
		console.log(s);
		this.setState(s);
	}
	addFilter() {
		this.setState({
			filters: this.state.filters.concat({
				field: null,
				operator: null,
				value: null
			})
		});
	}
	closeModal() {
		this.setState({ modalOpen: false });
	}
	componentWillReceiveProps(nextProps) {
		console.log(nextProps.newFilterField);
		let s = { modalOpen: nextProps.isOpen };
		if (nextProps.isOpen) {
			s.filters = this.state.filters.concat({
				field: nextProps.newFilterField,
				operator: null,
				value: null
			});
		}
		this.setState(s);
	}
	render() {
		let that = this, i = 0;
		let valueOptions = this.props.attributes.filter(function(attribute) {
			if (!that.state.field) return false;
			else return attribute.field == that.state.field.value;
		}).map(function(attribute) { return attribute.value; });
		valueOptions = [ ...new Set(valueOptions)]; // remove duplicates
		valueOptions = valueOptions.map(function(attribute) {
			return { value: attribute, label: attribute };
		});
		return (
			<Modal isOpen={this.state.modalOpen} contentLabel="Modal-FilterMaker">
				<div className="modalContent">
					<button className="pure-button" onClick={this.closeModal.bind(this)}><i className="fa fa-close" /></button>
					{this.state.filters.map(function(filter) {
						i++;
						return (
							<FilterRow key={i}
								fields={that.props.fields}
								attributes={that.props.attributes}
								field={filter.field}
								operator={filter.operator}
								value={filter.value} />
						);
					})}
					<br /><br />
					<button style={{float:'none'}} className="pure-button" onClick={this.addFilter.bind(this)}>Add Filter</button>
				</div>
			</Modal>
		);
	}
}
