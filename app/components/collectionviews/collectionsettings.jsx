import React from 'react';
import Select from 'react-select';

import collectionViews from './index.js';
import filterTypes from './filterTypes.js';
import FilterMaker from './filtermaker.jsx';

export default class CollectionSettingsShell extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			hide: null,
			sort: [],
			group: null,
			filters: [],
			filterModalOpen: false,
			matchAll: true,
			asc: true
		};
	}
	closeFilterModal() { this.setState({filterModalOpen: false}); }
	toggleAscDesc() {
		let s = {asc: !this.state.asc};
		this.setState(s);
		this.updateStoredFilters(s);
	}
	handleFilterChange(index, patch) {
		let filters = this.state.filters;
		if (!filters[index]) filters[index] = {};
		filters[index] = Object.assign(filters[index], patch);
		let s = {filters: filters};
		this.setState(s);
		this.updateStoredFilters(s);
	}
	handleFilterAnyAll() {
		let s = {matchAll:!this.state.matchAll};
		this.setState(s);
		this.updateStoredFilters(s);
	}
	handleSortFilterGroupChange(type, value) {
		let newFilter = false, s = {};
		if (type == 'filters') {
			for (let i in value) {
				if (value[i].value == 'new') {
					s.filterModalOpen = true;
					newFilter = true;
				}
			}
			if (!newFilter) {
				s[type] = value.map(function(filterOption) {
					return filterOption.value;
				});
			}
		}
		else {
			s[type] = value;
		}
		this.setState(s);
		this.updateStoredFilters(s);
	}
	updateStoredFilters(stateUpdate) {
		let id = 'filtersortgroup' + this.props.collection._id;
		let record = {
			data: {
				hide: stateUpdate.hide || this.state.hide,
				sort: stateUpdate.sort || this.state.sort,
				group: stateUpdate.group || this.state.group,
				filters: stateUpdate.filters || this.state.filters,
				asc: stateUpdate.asc || this.state.asc,
				matchAll: stateUpdate.matchAll || this.state.matchAll
			}
		};
		feathers_app.service('localdata').patch(id, record).catch(console.error);
	}
	getStoredFilters(props) {
		if (!props.collection._id) return;
		let id = 'filtersortgroup' + props.collection._id;
		feathers_app.service('localdata').get(id).then(result => {
			this.setState({
				hide: result.data.hide,
				sort: result.data.sort,
				group: result.data.group,
				filters: result.data.filters,
				asc: result.data.asc,
				matchAll: result.data.matchAll
			});
		}).catch(error => {
			feathers_app.service('localdata').create({id:id}).catch(console.error);
			this.setState({
				hide: null,
				sort: [],
				group: null,
				filters: [],
				asc: true,
				matchAll: true
			});
		});
	}
	componentDidMount() { this.getStoredFilters(this.props); }
	componentWillReceiveProps(nextProps) { this.getStoredFilters(this.props); }
	render() {
		let CollectionComponent = (collectionViews[this.props.collection.viewType])?
			collectionViews[this.props.collection.viewType].component:
			collectionViews['Table'].component;

		let that = this;
		let things = this.props.things,
			fields = this.props.fields,
			attributes = this.props.attributesObject,
			filters = this.state.filters;

		let displayFilters = filters.map(function(filter){
			let field = (filter.field)? filter.field.label: '',
				operator = (filter.operator)? filter.operator.label: '',
				value = (filter.value)? filter.value.label: ''; 
			return { 
				label: field +' '+ operator +' '+ value, 
				value: filter
			};
		});

		if (this.state.sort) {
			for (let i = this.state.sort.length - 1; i >= 0; i -= 1) {
				let sort = this.state.sort[i];
				things = things.sort(function(a,b) {
					let A = (attributes[a._id+sort.value])? attributes[a._id+sort.value].value: '',
						B = (attributes[b._id+sort.value])? attributes[b._id+sort.value].value: '';
					
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
			if (!this.state.asc) {
				things.reverse();
			}
		}
		if (filters.length > 0) {
			let filteredThings = [], filteredThingIDs = [];
			for (let filter of filters) {
				let operator = filter.operator.value,
					value = (filter.value)? filter.value.value: '',
					fieldID = (filter.field)? filter.field.value._id: null;
				if (operator && value && fieldID) {
					for (let thing of things) {
						let testAttribute = (attributes[thing._id+fieldID])? attributes[thing._id+fieldID]: null;
						let testValue = (testAttribute)? testAttribute.value: null;
						let comparison = operator.comparison || filterTypes[filter.operator.label].comparison;
						if (comparison(testValue, value) && filteredThingIDs.indexOf(thing._id) == -1) {
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
							multi={true}
							value={this.state.sort}
							options={this.props.fields.map(function(field){ return { value: field._id, label: field.name }; })}
							onChange={this.handleSortFilterGroupChange.bind(this, 'sort')} />
						<i className="fa fa-sort" onClick={this.toggleAscDesc.bind(this)} />
					</div>
					<div className="pure-u-1 pure-u-sm-1-2 pure-u-md-1-4">
						<Select
							placeholder="Filter"
							multi={true}
							value={displayFilters}
							options={[{value:'new', label:'Edit Filters'}]}
							onChange={this.handleSortFilterGroupChange.bind(this, 'filters')} />
						<i className="fa fa-filter" />
						<FilterMaker
							filters={filters}
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
							options={this.props.fields.map(function(field){ return { value:field._id, label:field.name }; })}
							onChange={this.handleSortFilterGroupChange.bind(this, 'group')} />
						<i className="fa fa-object-group" />
					</div>
			</div>
				<CollectionComponent
					collection={this.props.collection}
					fields={fields}
					things={things}
					attributes={this.props.attributes}
					attributesObject={attributes}
					group={this.state.group}
					onCreateField={this.props.onCreateField}
					onAddThing={this.props.onAddThing}
					onChangeFieldType={this.props.onChangeFieldType}
					onAddFieldOption={this.props.onAddFieldOption}
					onMoveField={this.props.onMoveField}
					onRenameField={this.props.onRenameField}
					onRemoveField={this.props.onRemoveField}
					onRemoveThing={this.props.onRemoveThing}
					onCreateOption={this.props.onCreateOption}
					onCommitValueChange={this.props.onCommitValueChange} />
			</div>
		);
	}
}