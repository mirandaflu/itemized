import React from 'react';
import Modal from 'react-modal';
import Select from 'react-select';

import filterTypes from './filterTypes.js'

class FilterRow extends React.Component {
	constructor(props) {
		super(props);
		let operatorOptions = [];
		for (let f in filterTypes) {
			operatorOptions.push({
				label: f,
				value: filterTypes[f]
			});
		}
		this.state = {
			operatorOptions: operatorOptions,
			field: this.props.field || null,
			operator: this.props.operator || { label: 'is', value: filterTypes.is },
			value: this.props.value || null
		}
	}
	handleSelectChange(type, value) {
		let s = {};
		s[type] = value;
		this.setState(s);
		this.props.onChange(s);
	}
	componentDidMount() {
		this.props.onChange({ operator: this.state.operator });
	}
	render() {
		let that = this;

		let valueOptions = this.props.attributes.filter(function(attribute) {
			if (!that.state.field) return false;
			else return attribute.field == that.state.field.value._id;
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
					options={this.props.fields.map(function(field){ return { value: field, label: field.name }; })} />
				<Select
					clearable={false}
					value={this.state.operator}
					onChange={this.handleSelectChange.bind(this, 'operator')}
					options={this.state.operatorOptions.filter(function(opt) {
						if (!that.state.field) return false;
						else return opt.value.fieldTypes.indexOf(that.state.field.value.type) !== -1;
					})} />
				{!this.state.operator.noValue && <Select.Creatable
					value={this.state.value}
					onChange={this.handleSelectChange.bind(this, 'value')}
					promptTextCreator={(label) => `${label} `}
					options={valueOptions} />}
			</div>
		);
	}
}

export default class FilterMaker extends React.Component {
	defaultFilter() {
		return {
			field: null,
			operator: {
				label: 'is',
				value: filterTypes.is
			},
			value: null
		};
	}
	addFilter() {
		this.props.onChange(this.props.filters.length, this.defaultFilter());
	}
	closeModal() {
		this.props.onClose();
	}
	componentWillReceiveProps(nextProps) {
		if (nextProps.isOpen && this.props.filters.length == 0) {
			this.addFilter();
		}
	}
	render() {
		let that = this, i = -1;
		return (
			<Modal isOpen={this.props.isOpen} contentLabel="Modal-FilterMaker">
				<div className="modalContent">
					<button className="pure-button" onClick={this.closeModal.bind(this)}><i className="fa fa-close" /></button>
					
					<form className="pure-form">
						<label htmlFor="all" className="pure-radio">
							<input type="radio" id="all" name="match" value="all"
								checked={this.props.matchAll} onChange={this.props.onToggleAnyAll} /> Match all
						</label>
						<label htmlFor="any" className="pure-radio">
							<input type="radio" id="any" name="match" value="any"
								checked={!this.props.matchAll} onChange={this.props.onToggleAnyAll} /> Match any
						</label>
					</form>

					<br /><br />

					{this.props.filters.map(function(filter) {
						i++;
						return (
							<FilterRow key={i}
								fields={that.props.fields}
								attributes={that.props.attributes}
								field={filter.field}
								operator={filter.operator}
								value={filter.value}
								onChange={that.props.onChange.bind(that, i)} />
						);
					})}
					<br />
					<button style={{float:'none'}} className="pure-button" onClick={this.addFilter.bind(this)}>Add Filter</button>
				</div>
			</Modal>
		);
	}
}
