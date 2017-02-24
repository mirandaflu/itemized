import React from 'react';
import Select from 'react-select';
import { Link, withRouter } from 'react-router';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';

import fieldTypes from '../attributes/index.js';
import StatusText from '../statustext.jsx';
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
			filterInProgress: false,
		};
	}
	handleFilterChange() {
		console.log('woo');
	}
	handleSortFilterGroupChange(type, value) {
		if (type == 'filter') {
			this.setState({
				filterInProgress: value
			});
		}
		else {
			let s = {};
			s[type] = value;
			this.setState(s);
		}
	}
	render() {
		let that = this;
		let things = this.props.things, fields = this.props.fields, attributes = this.props.attributesObject;

		if (this.state.sort) {
			things = things.sort(function(a,b) {
				let A = attributes[a._id+that.state.sort.value].value,
					B = attributes[b._id+that.state.sort.value].value;
				
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
							value={this.state.hide}
							options={fields.map(function(field){ return { value: field._id, label: field.name }; })}
							onChange={this.handleSortFilterGroupChange.bind(this, 'hide')} />
						<i className="fa fa-minus-square" />
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
							value={this.state.filter}
							options={fields.map(function(field){ return { value: field._id, label: field.name }; })}
							onChange={this.handleSortFilterGroupChange.bind(this, 'filter')} />
						<i className="fa fa-filter" />
						<FilterMaker
							isOpen={!!this.state.filterInProgress}
							onChange={this.handleFilterChange}
							fields={this.props.fields}
							attributes={this.props.attributes}
							newFilterField={this.state.filterInProgress} />
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
				<div style={{width:'100%', overflowX:'auto', overflowY:'visible', whiteSpace:'nowrap'}}>
					<table className="pure-table">
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
