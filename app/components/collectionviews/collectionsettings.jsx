import React from 'react';
import Select from 'react-select';
import { Link } from 'react-router';

import collectionViews from './index.js';
import filterTypes from './filterTypes.js';
import FilterMaker from './filtermaker.jsx';

export default class CollectionSettingsShell extends React.Component {
	state = {
		hide: [],
		sort: [],
		group: null,
		filters: [],
		filterModalOpen: false,
		matchAll: true,
		asc: true,
		controlsVisible: false,
		controlDivClassName: 'pure-u-1 pure-u-sm-1-2 pure-u-md-1-4 pure-u-lg-1-5'
	}
	closeFilterModal = () => this.setState({filterModalOpen: false});
	toggleAscDesc = () => {
		let s = {asc: !this.state.asc};
		this.setState(s);
		this.updateStoredFilters(s);
	}
	toggleControls = () => this.setState({ controlsVisible: !this.state.controlsVisible });
	moveCollection = (direction) => {
		let move = (direction == 'right')? 1: -1;
		feathers_app.service('collections').patch(null, {$inc: {position: -move}}, {query: {
			workspace: this.state.id,
			position: this.props.collection.position + move
		}}).then(result => {
			feathers_app.service('collections').patch(this.props.collection._id, {$inc: {position: move}}).catch(console.error);
		}).catch(console.error);
	}
	handleFilterChange = (index, patch) => {
		let filters = this.state.filters;
		if (!filters[index]) filters[index] = {};
		filters[index] = Object.assign(filters[index], patch);
		let s = {filters: filters};
		this.setState(s);
		this.updateStoredFilters(s);
	}
	handleFilterAnyAll = () => {
		let s = {matchAll:!this.state.matchAll};
		this.setState(s);
		this.updateStoredFilters(s);
	}
	handleControlChange = (type, value) => {
		let newFilter = false, s = {};
		switch(type) {
			case 'viewType':
			case 'boardField':
			case 'cardField':
			case 'dateField':
				s[type] = value.value;
				feathers_app.service('collections').patch(this.props.collection._id, s).catch(console.error);
				break;
			case 'swimLane':
				s[type] = (value == null)? null: value.value;
				feathers_app.service('collections').patch(this.props.collection._id, s).catch(console.error);
				break;
			case 'filters':
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
				this.setState(s);
				this.updateStoredFilters(s);
				break;
			default:
				s[type] = value;
				this.setState(s);
				this.updateStoredFilters(s);
				break;
		}
		
	}
	updateStoredFilters = (stateUpdate) => {
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
	getStoredFilters = (props) => {
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
		let CollectionControls = (collectionViews[this.props.collection.viewType])?
			collectionViews[this.props.collection.viewType].controls:
			collectionViews['Table'].controls;

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

		let activeFilterCount = 0;

		if (this.state.sort) {
			activeFilterCount += this.state.sort.length;
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
			activeFilterCount += filters.length;
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
			activeFilterCount += 1;
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
			activeFilterCount += this.state.hide.length;
			fields = fields.filter(function(field) {
				for (let h of that.state.hide) {
					if (h.value == field._id) return false;
				}
				return true;
			});
		}

		let viewOptions = [];
		for (let o in collectionViews) {
			viewOptions.push({'value':o, 'label':o});
		}
		let boardOptions = this.props.fields
			.filter(function(field) { return field.type == 'Single Select'; })
			.map(function(field) { return {value: field._id, label: field.name}; });
		let cardOptions = this.props.fields
			.map(function(field) { return {value: field._id, label: field.name}; });
		let swimLaneOptions = boardOptions;
		let dateFieldOptions = this.props.fields
			.filter(function(field) { return field.type.indexOf('Date') != -1; })
			.map(function(field) { return {value: field._id, label: field.name}; });

		return (
			<div>
				<div className="sortfiltergroup pure-g"
					style={{display:(this.state.controlsVisible)?'inherit':'none'}}>
					<div className={this.state.controlDivClassName}>
						<Select
							placeholder="View as"
							value={this.props.collection.viewType}
							options={viewOptions}
							clearable={false}
							onChange={this.handleControlChange.bind(this, 'viewType')} />
						<i className="fa fa-eye" />
					</div>
					{CollectionControls.listby &&
						<div className={this.state.controlDivClassName}>
							<Select
								placeholder="List by"
								value={this.props.collection.boardField}
								options={boardOptions}
								clearable={false}
								onChange={this.handleControlChange.bind(this, 'boardField')} />
							<i className="fa fa-columns" />
						</div>
					}
					{CollectionControls.cardname &&
						<div className={this.state.controlDivClassName}>
							<Select
								placeholder="Card name"
								value={this.props.collection.cardField}
								options={cardOptions}
								clearable={false}
								onChange={this.handleControlChange.bind(this, 'cardField')} />
							<i className="fa fa-clone" />
						</div>
					}
					{CollectionControls.swimlane &&
						<div className={this.state.controlDivClassName}>
							<Select
								placeholder="Swim lane"
								value={this.props.collection.swimLane}
								options={swimLaneOptions}
								clearable={true}
								onChange={this.handleControlChange.bind(this, 'swimLane')} />
							<i className="fa fa-tasks" />
						</div>
					}
					{CollectionControls.hide &&
						<div className={this.state.controlDivClassName}>
							<Select
								placeholder="Hide"
								multi={true}
								searchable={false}
								value={this.state.hide}
								options={fields.map(function(field){ return { value: field._id, label: field.name }; })}
								onChange={this.handleControlChange.bind(this, 'hide')} />
							<i className="fa fa-eye-slash" />
						</div>
					}
					{CollectionControls.sort &&
						<div className={this.state.controlDivClassName}>
							<Select
								placeholder="Sort"
								multi={true}
								value={this.state.sort}
								options={this.props.fields.map(function(field){ return { value: field._id, label: field.name }; })}
								onChange={this.handleControlChange.bind(this, 'sort')} />
							<i className="fa fa-sort" onClick={this.toggleAscDesc} />
						</div>
					}
					{CollectionControls.dateby &&
						<div className={this.state.controlDivClassName}>
							<Select
								placeholder="Date by"
								value={this.props.collection.dateField}
								options={dateFieldOptions}
								clearable={false}
								onChange={this.handleControlChange.bind(this, 'dateField')} />
							<i className="fa fa-calendar" />
						</div>
					}
					<div className={this.state.controlDivClassName}>
						<Select
							placeholder="Filter"
							multi={true}
							value={displayFilters}
							options={[{value:'new', label:'Edit Filters'}]}
							onChange={this.handleControlChange.bind(this, 'filters')} />
						<i className="fa fa-filter" />
						<FilterMaker
							filters={filters}
							isOpen={this.state.filterModalOpen}
							onClose={this.closeFilterModal}
							onChange={this.handleFilterChange}
							onToggleAnyAll={this.handleFilterAnyAll}
							matchAll={this.state.matchAll}
							fields={this.props.fields}
							attributes={this.props.attributes} />
					</div>
					{CollectionControls.group &&
						<div className={this.state.controlDivClassName}>
							<Select
								placeholder="Group"
								value={this.state.group}
								options={this.props.fields.map(function(field){ return { value:field._id, label:field.name }; })}
								onChange={this.handleControlChange.bind(this, 'group')} />
							<i className="fa fa-object-group" />
						</div>
					}
					{!this.props.readOnly &&
						<div className={this.state.controlDivClassName} style={{textAlign:'center'}}>
							<button className="pure-button button-small"
								disabled={this.props.collection.position == 0}
								onClick={this.moveCollection.bind(this, 'left')}>
								<i className="fa fa-arrow-left" />
							</button>
							<button className="pure-button button-small" disabled="true">Reorder</button>
							<button className="pure-button button-small"
								disabled={this.props.collection.position == this.props.collectionsLength - 1}
								onClick={this.moveCollection.bind(this, 'right')}>
								<i className="fa fa-arrow-right" />
							</button>
						</div>
					}
					{!this.props.readOnly &&
						<div className={this.state.controlDivClassName} style={{textAlign:'center'}}>
							<Link className="pure-button button-small"
								to={'/workspace/'+this.props.collection.workspace+'/collection/'+this.props.collection._id+'/configure'}>
								Edit Collection
							</Link>
						</div>
					}
				</div>
				<div className="pure-g">
					<div className="pure-u-1">
						<button
							style={{float:'right'}}
							className="pure-button button-small"
							onClick={this.toggleControls}>
							{this.state.controlsVisible &&
								<div>
									<i className="fa fa-gear" /> <i className="fa fa-caret-up" />
								</div>
							}
							{!this.state.controlsVisible &&
								<div title={activeFilterCount+' active filter(s)'}>
									{(activeFilterCount > 0)?activeFilterCount+' ':''}
									<i className="fa fa-gear" /> <i className="fa fa-caret-down" />
								</div>
							}
						</button>
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
					onCommitValueChange={this.props.onCommitValueChange}
					readOnly={this.props.readOnly} />
			</div>
		);
	}
}