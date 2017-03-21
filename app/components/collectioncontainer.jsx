import React from 'react';
import { Link, withRouter } from 'react-router';

import fieldTypes from './attributes/index.js';
import CollectionSettingsShell from './collectionviews/collectionsettings.jsx'
import StatusText from '../components/statustext.jsx';

class CollectionContainer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			id: this.props.routeParams.collection,
			collection: { viewType: 'Table' },
			fields: [],
			things: [],
			attributes: []
		};
	}
	createField = () => {
		let name = prompt('Name?');
		if (!name) return;
		feathers_app.service('fields').create({
			name: name,
			coll: this.state.id,
			position: this.state.fields.length
		}).catch(this.showMessage.bind(this));
	}
	moveField = (event, data) => {
		let move = (data.move == 'right')? 1: -1;
		feathers_app.service('fields').patch(null, {$inc: {position: -move}}, {query: {
			coll: this.state.id,
			position: data.field.position + move
		}}).then(result => {
			feathers_app.service('fields').patch(data.field._id, {$inc: {position: move}})
				.catch(this.showMessage.bind(this));
		}).catch(this.showMessage.bind(this));
	}
	renameField = (event, data) => {
		let name = prompt('Name?');
		if (!name) return;
		feathers_app.service('fields').patch(data.field._id, {name: name}).catch(this.showMessage.bind(this));
	}
	changeFieldType = (event, data) => {
		let type = prompt('Type?');
		if (!fieldTypes[type]) { alert('invalid'); return; }
		feathers_app.service('fields').patch(data.field._id, {type: type, options: []})
			.catch(this.showMessage.bind(this));
	}
	addFieldOption = (event, data) => {
		let option = prompt('Option?');
		if (!option) return;
		feathers_app.service('fields').patch(data.field._id, {$push: {options: option}})
			.catch(this.showMessage.bind(this));
	}
	handleCreateOption = (field, option) => {
		feathers_app.service('fields').patch(field, {$push: {options: option}})
			.catch(this.showMessage.bind(this));
	}
	removeField = (event, data) => {
		if (!confirm('Are you sure?')) return;
		feathers_app.service('fields').remove(data.field._id).catch(this.showMessage.bind(this));
	}
	handleCreatedField = (field) => {
		if (field.coll != this.state.id) return;
		this.setState({ fields: this.state.fields.concat(field) });
	}
	handlePatchedField = (field) => {
		if (!this._mounted) return;
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
	handleRemovedField = (field) => {
		for (let i in this.state.fields) {
			if (this.state.fields[i]._id == field._id) {
				let newFields = this.state.fields;
				newFields.splice(i, 1);
				this.setState({ fields: newFields });
				break;
			}
		}
	}
	addThing = () => feathers_app.service('things').create({coll: this.state.id}).catch(this.showMessage.bind(this));
	removeThing = (event, data) => {
		if (!confirm('Are you sure?')) return;
		feathers_app.service('things').remove(data.thing._id).catch(this.showMessage.bind(this));
	}
	handleCreatedThing = (thing) => {
		if (thing.coll != this.state.id) return;
		this.setState({things: this.state.things.concat(thing)});
	}
	handlePatchedThing = (thing) => {
		for (let i in this.state.things) {
			if (this.state.things[i]._id == thing._id) {
				let newThings = Object.assign(this.state.things);
				newThings[i] = Object.assign({}, thing);
				this.setState({ things: newThings });
				break;
			}
		}
	}
	handleRemovedThing = (thing) => {
		for (let i in this.state.things) {
			if (this.state.things[i]._id == thing._id) {
				let newThings = this.state.things;
				newThings.splice(i, 1)
				this.setState({ things: newThings });
				break;
			}
		}
	}
	commitValueChange = (thing, field, attribute, e) => {
		let newAttribute = {
			coll: this.state.id,
			thing: thing,
			field: field,
			value: e.target.value
		};
		if (attribute == null) {
			feathers_app.service('attributes').create(newAttribute).catch(this.showMessage.bind(this));
		}
		else if (newAttribute.value != attribute.value) {
			feathers_app.service('attributes').patch(attribute._id, {value: newAttribute.value})
				.catch(this.showMessage.bind(this));
		}
	}
	handleCreatedAttribute = (attribute) => {
		if (attribute.coll != this.state.id) return;
		this.setState({ attributes: this.state.attributes.concat(attribute) });
	}
	handlePatchedAttribute = (attribute) => {
		for (let i in this.state.attributes) {
			if (this.state.attributes[i]._id == attribute._id) {
				let newAttributes = this.state.attributes;
				newAttributes[i] = Object.assign({}, attribute);
				this.setState({ attributes: newAttributes });
				break;
			}
		}
	}
	handleRemovedAttribute = (attribute) => {
		for (let i in this.state.attributes) {
			if (this.state.attributes[i]._id == attribute._id) {
				let newAttributes = this.state.attributes;
				newAttributes.splice(i, 1);
				this.setState({ attributes: newAttributes });
				break;
			}
		}
	}
	handlePatchedCollection = (collection) => {
		if (collection._id == this.state.collection._id) {
			this.setState({ collection: collection });
		}
	}
	showMessage = (error) => this.props.messageBanner.showMessage(error.message);
	loadData = (collection) => {
		if (typeof collection == 'undefined') {
			collection = this.state.id;
		}
		feathers_app.service('collections').get(collection)
			.then(result => { this.setState({collection: result}); });
		feathers_app.service('fields').find({query: {coll: collection, $sort: {position: 1}}})
			.then(result => { this.setState({fields: result}); });
		feathers_app.service('things').find({query: {coll: collection}})
			.then(result => { this.setState({things: result.data}); });
		feathers_app.service('attributes').find({query: {coll: collection}})
			.then(result => { this.setState({attributes: result}); });
	}
	bindEventListeners = () => {
		feathers_app.service('fields').on('created', this.handleCreatedField);
		feathers_app.service('fields').on('patched', this.handlePatchedField);
		feathers_app.service('fields').on('removed', this.handleRemovedField);
		feathers_app.service('things').on('created', this.handleCreatedThing);
		feathers_app.service('things').on('patched', this.handlePatchedThing);
		feathers_app.service('things').on('removed', this.handleRemovedThing);
		feathers_app.service('attributes').on('created', this.handleCreatedAttribute);
		feathers_app.service('attributes').on('patched', this.handlePatchedAttribute);
		feathers_app.service('attributes').on('removed', this.handleRemovedAttribute);
		feathers_app.service('collections').on('patched', this.handlePatchedCollection);
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
		feathers_app.service('fields').removeListener('created', this.handleCreatedField);
		feathers_app.service('fields').removeListener('patched', this.handlePatchedField);
		feathers_app.service('fields').removeListener('removed', this.handleRemovedField);
		feathers_app.service('things').removeListener('created', this.handleCreatedThing);
		feathers_app.service('things').removeListener('patched', this.handlePatchedThing);
		feathers_app.service('things').removeListener('removed', this.handleRemovedThing);
		feathers_app.service('attributes').removeListener('created', this.handleCreatedAttribute);
		feathers_app.service('attributes').removeListener('patched', this.handlePatchedAttribute);
		feathers_app.service('attributes').removeListener('removed', this.handleRemovedAttribute);
		feathers_app.service('collections').removeListener('patched', this.handlePatchedCollection);
	}
	render() {
		let that = this;
		let attributesObject = {};
		for (let attr of this.state.attributes) {
			attributesObject[attr.thing + attr.field] = attr;
		}
		return (
			<div>
				<CollectionSettingsShell
					collection={this.state.collection}
					collectionsLength={this.props.collectionsLength}
					fields={this.state.fields}
					things={this.state.things}
					attributes={this.state.attributes}
					attributesObject={attributesObject}
					onCreateField={this.createField}
					onAddThing={this.addThing}
					onChangeFieldType={this.changeFieldType}
					onAddFieldOption={this.addFieldOption}
					onMoveField={this.moveField}
					onRenameField={this.renameField}
					onRemoveField={this.removeField}
					onRemoveThing={this.removeThing}
					onCreateOption={this.handleCreateOption}
					onCommitValueChange={this.commitValueChange}
					readOnly={this.props.readOnly} />
				{ React.Children.map(this.props.children, child => React.cloneElement(child, {
					attributesObject: attributesObject,
					fields: this.state.fields,
					onCreateOption: this.handleCreateOption,
					onCommitValueChange: this.commitValueChange,
					readOnly: this.props.readOnly
				})) }
			</div>
		);
	}
}

module.exports = withRouter(CollectionContainer);
