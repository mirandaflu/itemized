import React from 'react';
import Select from 'react-select';
import { Link, withRouter } from 'react-router';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';

import fieldTypes from '../attributes/index.js';
import StatusText from '../statustext.jsx';
import filterTypes from './filterTypes.js';
import FieldHeader from './fieldheader.jsx';
import FilterMaker from './filtermaker.jsx';

class CollectionTable extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			hide: null,
			sort: null,
			group: null,
			filters: [],
			filterModalOpen: false,
			matchAll: true
		};
	}
	closeFilterModal() { this.setState({filterModalOpen: false}); }
	handleFilterChange(filters) {
		this.setState({filters: filters.map(function(filter) {
			let field = (filter.field)? filter.field.label: '',
				value = (filter.value)? filter.value.label: '';
			return {
				label: field +' '+ filter.operator.label +' '+ value,
				value: filter
			};
		})});
	}
	handleFilterAnyAll() { this.setState({matchAll:!this.state.matchAll}); }
	handleSortFilterGroupChange(type, value) {
		let newFilter = false;
		if (type == 'filters') {
			for (let i in value) {
				if (value[i].value == 'new') {
					this.setState({filterModalOpen: true});
					newFilter = true;
				}
			}
		}
		if (!newFilter) {
			let s = {};
			s[type] = value;
			this.setState(s);
		}
	}
	render() {
		let that = this;
		let things = this.props.things, fields = this.props.fields, attributes = this.props.attributesObject, filters = this.state.filters;

		if (this.state.sort) {
			things = things.sort(function(a,b) {
				let A = (attributes[a._id+that.state.sort.value])? attributes[a._id+that.state.sort.value].value: '',
					B = (attributes[b._id+that.state.sort.value])? attributes[b._id+that.state.sort.value].value: '';
				
				switch(typeof A) {
					case 'number':
						return A - B;
					case 'string':
						if (A < B) return -1;
						if (A > B) return 1;
						return 0;
				}
			});
		}
		if (filters.length > 0) {
			let filteredThings = [], filteredThingIDs = [];
			for (let filter of filters) {
				let operator = filter.value.operator.value,
					value = (filter.value && filter.value.value)? filter.value.value.value: '',
					fieldID = (filter.value && filter.value.field)? filter.value.field.value._id: null;
				if (operator && value && fieldID) {
					for (let thing of things) {
						let testAttribute = (attributes[thing._id+fieldID])? attributes[thing._id+fieldID]: null;
						let testValue = (testAttribute)? testAttribute.value: null;
						if (filter.value.operator.value.comparison(testValue, value) && filteredThingIDs.indexOf(thing._id) == -1) {
							filteredThings.push(thing);
							filteredThingIDs.push(thing._id);
						}
					}
				}
				if (this.state.matchAll) {
					things = filteredThings;
					filteredThings = [];
					filteredThingIDs = [];
				}
			}
			if (!this.state.matchAll) things = filteredThings;
		}
		if (this.state.group) {
			things = things.sort(function(a,b) {
				let A = (attributes[a._id+that.state.group.value])? attributes[a._id+that.state.group.value].value: '',
					B = (attributes[b._id+that.state.group.value])? attributes[b._id+that.state.group.value].value: '';
				
				switch(typeof A) {
					case 'number':
						return A - B;
					case 'string':
						if (A < B) return -1;
						if (A > B) return 1;
						return 0;
				}
			});
			let currentGroupRow = things[0];
			currentGroupRow.rowSpan = 1;
			for (let i = 1; i < things.length; i++) {
				if (attributes[things[i]._id+that.state.group.value] && attributes[currentGroupRow._id+that.state.group.value] &&
				attributes[things[i]._id+that.state.group.value].value == attributes[currentGroupRow._id+that.state.group.value].value) {
					currentGroupRow.rowSpan += 1;
					things[i].rowSpan = 0;
				}
				else if ((!attributes[things[i]._id+that.state.group.value] || attributes[things[i]._id+that.state.group.value].value == '') &&
				(!attributes[currentGroupRow._id+that.state.group.value] || attributes[currentGroupRow._id+that.state.group.value].value == '')) {
					currentGroupRow.rowSpan += 1;
					things[i].rowSpan = 0;
				}
				else {
					currentGroupRow = things[i];
					currentGroupRow.rowSpan = 1;
				}
			}
		}
		if (this.state.hide) {
			fields = fields.filter(function(field) {
				for (let h of that.state.hide) {
					if (h.value == field._id) return false;
				}
				return true;
			});
		}

		return (
			<div>
				<div className="sortfiltergroup pure-g">
					<div className="pure-u-1 pure-u-sm-1-2 pure-u-md-1-4">
						<Select
							placeholder="Hide"
							multi={true}
							searchable={false}
							value={this.state.hide}
							options={fields.map(function(field){ return { value: field._id, label: field.name }; })}
							onChange={this.handleSortFilterGroupChange.bind(this, 'hide')} />
						<i className="fa fa-eye-slash" />
					</div>
					<div className="pure-u-1 pure-u-sm-1-2 pure-u-md-1-4">
						<Select
							placeholder="Sort"
							value={this.state.sort}
							options={fields.map(function(field){ return { value: field._id, label: field.name }; })}
							onChange={this.handleSortFilterGroupChange.bind(this, 'sort')} />
						<i className="fa fa-sort" />
					</div>
					<div className="pure-u-1 pure-u-sm-1-2 pure-u-md-1-4">
						<Select
							placeholder="Filter"
							multi={true}
							value={filters}
							options={[{value:'new', label:'Edit Filters'}]}
							onChange={this.handleSortFilterGroupChange.bind(this, 'filters')} />
						<i className="fa fa-filter" />
						<FilterMaker
							isOpen={this.state.filterModalOpen}
							onClose={this.closeFilterModal.bind(this)}
							onChange={this.handleFilterChange.bind(this)}
							onToggleAnyAll={this.handleFilterAnyAll.bind(this)}
							matchAll={this.state.matchAll}
							fields={this.props.fields}
							attributes={this.props.attributes} />
					</div>
					<div className="pure-u-1 pure-u-sm-1-2 pure-u-md-1-4">
						<Select
							placeholder="Group"
							value={this.state.group}
							options={fields.map(function(field){ return { value:field._id, label:field.name }; })}
							onChange={this.handleSortFilterGroupChange.bind(this, 'group')} />
						<i className="fa fa-object-group" />
					</div>
				</div>
				<div style={{width:'100%', overflowX:'auto', overflowY:'visible'}}>
					<table className="pure-table animated fadeIn">
						<thead>
							<tr>
								<th></th>
								{fields.map(function(field){
									return(
										<th key={field._id}>
											<FieldHeader
												fieldsLength={fields.length}
												field={field}
												onMove={that.props.onMoveField} />
										</th>
									);
								})}
								<th>
									<button className="pure-button button-secondary" onClick={this.props.onCreateField}>Add Field</button>
								</th>
							</tr>
						</thead>
						<tbody>
							{things.map(function(thing){
								return(
									<tr key={thing._id}>
										<td>
											<ContextMenuTrigger id={'thing'+thing._id}>
												=
											</ContextMenuTrigger>
											<ContextMenu id={'thing'+thing._id}>
												<MenuItem data={{thing: thing}} onClick={that.props.onRemoveThing}>
													Delete Thing
												</MenuItem>
											</ContextMenu>
										</td>
										{fields.map(function(field){
											let value = '', attribute = null, style = {},
												FieldComponent = fieldTypes[field.type].component;
											if (that.props.attributesObject[thing._id + field._id]) {
												attribute = that.props.attributesObject[thing._id + field._id];
												value = attribute.value;
											}
											let rowSpan = 1;
											if (that.state.group && that.state.group.value == field._id) {
												if (thing.rowSpan > 0) {
													rowSpan = thing.rowSpan;
													FieldComponent = fieldTypes['Static'].component;
													style = {textAlign:'center'};
												}
												else return null;
											}
											return (
												<td className="cell" style={style} rowSpan={rowSpan} key={thing._id + field._id}>
													<FieldComponent
														fieldType={field.type}
														attribute={attribute}
														value={value}
														options={field.options}
														onCreateOption={that.props.onCreateOption.bind(that, field._id)}
														onCommitChange={that.props.onCommitValueChange.bind(that, thing._id, field._id, attribute)} />
												</td>
											);
										})}
									</tr>
								);
							})}
						</tbody>
					</table>
					<button className="pure-button button-secondary" style={{marginTop:'8px'}} onClick={this.props.onAddThing}>Add Thing</button>
				</div>
			</div>
		);
	}
}

module.exports = withRouter(CollectionTable);
