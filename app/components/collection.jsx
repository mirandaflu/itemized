import React from 'react';
import { Link, withRouter } from 'react-router';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

import fieldTypes from './attributes/index.js';
import StatusText from '../components/statustext.jsx';

class Collection extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			id: this.props.routeParams.collection,
			fields: [],
			things: [],
			attributes: []
		};
	}
	createField() {
		let name = prompt('Name?');
		if (!name) return;
		feathers_app.service('fields').create({
			name: name,
			coll: this.state.id,
			position: this.state.fields.length
		}).catch(console.error);
	}
	moveField(e, data) {
		let move = (data.move == 'right')? 1: -1;
		feathers_app.service('fields').patch(null, {$inc: {position: -move}}, {query: {
			coll: this.state.id,
			position: data.field.position + move
		}}).then(result => {
			feathers_app.service('fields').patch(data.field._id, {$inc: {position: move}}).catch(console.error);
		}).catch(console.error);
	}
	renameField(e, data) {
		let name = prompt('Name?');
		if (!name) return;
		feathers_app.service('fields').patch(data.field._id, {name: name}).catch(console.error);
	}
	changeFieldType(e, data) {
		let type = prompt('Type?');
		if (!fieldTypes[type]) { alert('invalid'); return; }
		feathers_app.service('fields').patch(data.field._id, {type: type, options: []}).catch(console.error);
	}
	addFieldOption(e, data) {
		let option = prompt('Option?');
		if (!option) return;
		feathers_app.service('fields').patch(data.field._id, {$push: {options: option}}).catch(console.error);
	}
	handleCreateOption(field, option) {
		feathers_app.service('fields').patch(field, {$push: {options: option}}).catch(console.error);
	}
	removeField(e, data) {
		if (!confirm('Are you sure?')) return;
		feathers_app.service('fields').remove(data.field._id).catch(console.error);
	}
	handleCreatedField(field) {
		if (field.coll != this.state.id) return;
		this.setState({ fields: this.state.fields.concat(field) });
	}
	handlePatchedField(field) {
		for (let i in this.state.fields) {
			if (this.state.fields[i]._id == field._id) {
				let newFields = this.state.fields;
				newFields[i] = Object.assign({}, field);
				newFields.sort((a,b) => { return a.position - b.position; });
				this.setState({ fields: newFields });
				break;
			}
		}
	}
	handleRemovedField(field) {
		for (let i in this.state.fields) {
			if (this.state.fields[i]._id == field._id) {
				let newFields = this.state.fields;
				newFields.splice(i, 1);
				this.setState({ fields: newFields });
				break;
			}
		}
	}
	addThing() {
		feathers_app.service('things').create({coll: this.state.id}).catch(console.error);
	}
	removeThing(e, data) {
		if (!confirm('Are you sure?')) return;
		feathers_app.service('things').remove(data.thing._id).catch(console.error);
	}
	handleCreatedThing(thing) {
		if (thing.coll != this.state.id) return;
		this.setState({things: this.state.things.concat(thing)});
	}
	handleRemovedThing(thing) {
		for (let i in this.state.things) {
			if (this.state.things[i]._id == thing._id) {
				let newThings = this.state.things;
				newThings.splice(i, 1)
				this.setState({ things: newThings });
				break;
			}
		}
	}
	commitValueChange(thing, field, attribute, e) {
		let newAttribute = {
			coll: this.state.id,
			thing: thing,
			field: field,
			value: e.target.value
		};
		if (attribute == null) {
			feathers_app.service('attributes').create(newAttribute).catch(console.error);
		}
		else if (newAttribute.value != attribute.value) {
			feathers_app.service('attributes').patch(attribute._id, {value: newAttribute.value}).catch(console.error);
		}
	}
	handleCreatedAttribute(attribute) {
		if (attribute.coll != this.state.id) return;
		this.setState({ attributes: this.state.attributes.concat(attribute) });
	}
	handlePatchedAttribute(attribute) {
		for (let i in this.state.attributes) {
			if (this.state.attributes[i]._id == attribute._id) {
				let newAttributes = this.state.attributes;
				newAttributes[i] = Object.assign({}, attribute);
				this.setState({ attributes: newAttributes });
				break;
			}
		}
	}
	handleRemovedAttribute(attribute) {
		for (let i in this.state.attributes) {
			if (this.state.attributes[i]._id == attribute._id) {
				let newAttributes = this.state.attributes;
				newAttributes.splice(i, 1);
				this.setState({ attributes: newAttributes });
				break;
			}
		}
	}
	loadData(collection) {
		if (typeof collection == 'undefined') {
			collection = this.state.id;
		}
		feathers_app.service('fields').find({query: {coll: collection, $sort: {position: 1}}})
			.then(result => { this.setState({fields: result}); });
		feathers_app.service('things').find({query: {coll: collection}})
			.then(result => { this.setState({things: result.data}); });
		feathers_app.service('attributes').find({query: {coll: collection}})
			.then(result => { this.setState({attributes: result}); });
	}
	bindEventListeners() {
		this.fieldCreatedListener = this.handleCreatedField.bind(this);
		this.fieldPatchedListener = this.handlePatchedField.bind(this);
		this.fieldRemovedListener = this.handleRemovedField.bind(this);
		feathers_app.service('fields').on('created', this.fieldCreatedListener);
		feathers_app.service('fields').on('patched', this.fieldPatchedListener);
		feathers_app.service('fields').on('removed', this.fieldRemovedListener);
		this.thingCreatedListener = this.handleCreatedThing.bind(this);
		this.thingRemovedListener = this.handleRemovedThing.bind(this);
		feathers_app.service('things').on('created', this.thingCreatedListener);
		feathers_app.service('things').on('removed', this.thingRemovedListener);
		this.attributeCreatedListener = this.handleCreatedAttribute.bind(this);
		this.attributePatchedListener = this.handlePatchedAttribute.bind(this);
		this.attributeRemovedListener = this.handleRemovedAttribute.bind(this);
		feathers_app.service('attributes').on('created', this.attributeCreatedListener);
		feathers_app.service('attributes').on('patched', this.attributePatchedListener);
		feathers_app.service('attributes').on('removed', this.attributeRemovedListener);

	}
	componentWillReceiveProps(nextProps) {
		this.setState({id: nextProps.routeParams.collection});
		this.loadData(nextProps.routeParams.collection);
	}
	componentDidMount() {
		this.loadData();
		this.bindEventListeners();
	}
	componentWillUnmount() {
		feathers_app.service('fields').removeListener('created', this.fieldCreatedListener);
		feathers_app.service('fields').removeListener('patched', this.fieldPatchedListener);
		feathers_app.service('fields').removeListener('removed', this.fieldRemovedListener);
		feathers_app.service('things').removeListener('created', this.thingCreatedListener);
		feathers_app.service('things').removeListener('removed', this.thingRemovedListener);
		feathers_app.service('attributes').removeListener('created', this.attributeCreatedListener);
		feathers_app.service('attributes').removeListener('patched', this.attributePatchedListener);
		feathers_app.service('attributes').removeListener('removed', this.attributeRemovedListener);
	}
	render() {
		let that = this;
		let attributesObject = {};
		for (let attr of this.state.attributes) {
			attributesObject[attr.thing + attr.field] = attr;
		}
		return (
			<div className="workspace">
				<table className="pure-table">
					<thead>
						<tr>
							<th></th>
							{this.state.fields.map(function(field){
								return(
									<th key={field._id}>
										<ContextMenuTrigger id={'field'+field._id}>
											{field.name}
										</ContextMenuTrigger>
										<ContextMenu id={'field'+field._id}>
											<MenuItem data={{field: field}} onClick={that.changeFieldType.bind(that)}>
												Change Type
											</MenuItem>
											{field.type == 'Single Select' &&
												<MenuItem data={{field: field}} onClick={that.addFieldOption.bind(that)}>
													Add Option
												</MenuItem>
											}
											{field.position != that.state.fields.length-1 &&
												<MenuItem data={{move:'right', field: field}} onClick={that.moveField.bind(that)}>
													Move Right
												</MenuItem>
											}
											{field.position != 0 &&
												<MenuItem data={{move:'left', field: field}} onClick={that.moveField.bind(that)}>
													Move Left
												</MenuItem>
											}
											<MenuItem data={{field: field}} onClick={that.renameField.bind(that)}>
												Rename Field
											</MenuItem>
											<MenuItem data={{field: field}} onClick={that.removeField.bind(that)}>
												Delete Field
											</MenuItem>
										</ContextMenu>
									</th>
								);
							})}
							<th>
								<button className="pure-button" onClick={this.createField.bind(this)}>Add Field</button>
							</th>
						</tr>
					</thead>
					<tbody>
						{this.state.things.map(function(thing){
							return(
								<tr key={thing._id}>
									<td>
										<ContextMenuTrigger id={'thing'+thing._id}>
											=
										</ContextMenuTrigger>
										<ContextMenu id={'thing'+thing._id}>
											<MenuItem data={{thing: thing}} onClick={that.removeThing.bind(that)}>
												Delete Thing
											</MenuItem>
										</ContextMenu>
									</td>
									{that.state.fields.map(function(field){
										let value = '', attribute = null;
										if (attributesObject[thing._id + field._id]) {
											attribute = attributesObject[thing._id + field._id];
											value = attribute.value;
										}
										let FieldComponent = fieldTypes[field.type].component;
										return (
											<td className="cell" key={thing._id + field._id}>
												<FieldComponent
													fieldType={field.type}
													attribute={attribute}
													value={value}
													options={field.options}
													onCreateOption={that.handleCreateOption.bind(that, field._id)}
													onCommitChange={that.commitValueChange.bind(that, thing._id, field._id, attribute)} />
											</td>
										);
									})}
								</tr>
							);
						})}
					</tbody>
				</table>
				<br />
				<button className="pure-button" onClick={this.addThing.bind(this)}>Add Thing</button>
			</div>
		);
	}
}

module.exports = withRouter(Collection);
