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
		this.props.onChange(s);
		this.setState(s);
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
			filters: []
		};
	}
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
		this.setState({
			filters: this.state.filters.concat(this.defaultFilter())
		});
	}
	handleFilterChange(index, state) {
		let filters = this.state.filters;
		filters[index] = Object.assign(filters[index], state);
		this.setState({filters: filters});
		this.props.onChange(filters);
	}
	closeModal() {
		this.props.onClose();
	}
	componentWillReceiveProps(nextProps) {
		let s = { modalOpen: nextProps.isOpen };
		if (nextProps.isOpen && this.state.filters.length == 0) {
			s.filters = this.state.filters.concat(this.defaultFilter());
		}
		this.setState(s);
	}
	render() {
		let that = this, i = -1;
		return (
			<Modal isOpen={this.state.modalOpen} contentLabel="Modal-FilterMaker">
				<div className="modalContent">
					<button className="pure-button" onClick={this.closeModal.bind(this)}><i className="fa fa-close" /></button>
					
					<form className="pure-form">
						<label htmlFor="all" className="pure-radio">
							<input type="radio" id="all" name="match" value="all" checked={this.props.matchAll} onChange={this.props.onToggleAnyAll} /> Match all
						</label>
						<label htmlFor="any" className="pure-radio">
							<input type="radio" id="any" name="match" value="any" checked={!this.props.matchAll} onChange={this.props.onToggleAnyAll} /> Match any
						</label>
					</form>

					<br /><br />

					{this.state.filters.map(function(filter) {
						i++;
						return (
							<FilterRow key={i}
								fields={that.props.fields}
								attributes={that.props.attributes}
								field={filter.field}
								operator={filter.operator}
								value={filter.value}
								onChange={that.handleFilterChange.bind(that, i)} />
						);
					})}
					<br />
					<button style={{float:'none'}} className="pure-button" onClick={this.addFilter.bind(this)}>Add Filter</button>
				</div>
			</Modal>
		);
	}
}
