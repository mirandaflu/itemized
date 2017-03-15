import React from 'react';
import Modal from 'react-modal';
import Select from 'react-select';
import { withRouter } from 'react-router';

import fieldTypes from './attributes/index.js';
import MessageBanner from './messagebanner.jsx';

class ConfigureField extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			options: [],
			fieldOptions: [],
			collectionOptions: [],
			collection: {}
		};
	}
	loadField() {
		feathers_app.service('fields').get(this.props.params.field)
			.then(result => {
				this.setState(result);
				if (result.collectionReference) this.loadFields(result.collectionReference);
			})
			.catch(console.error);
	}
	loadCollections() {
		feathers_app.service('collections').find({query:{workspace:this.props.params.workspace}})
			.then(collections => {
				this.setState({ collectionOptions: collections.map(collection => {
					return {
						label: collection.name,
						value: collection._id
					};
				})});
			}).catch(console.error);
	}
	loadFields(collection) {
		feathers_app.service('fields').find({query:{coll:collection}})
			.then(fields => {
				this.setState({fieldOptions:fields.map(field => {
					return {
						label: field.name,
						value: field._id
					};
				})});
			})
	}
	handleOptionsSelectChange(property, values) {
		let value = values.value;
		if (values.length) value = values.map(function(v) { return v.value; });
		let s = {};
		s[property] = value;
		this.setState(s);
		feathers_app.service('fields').patch(this.props.params.field, s).catch(console.error);
	}
	handleSelectCollection(value) {
		this.setState({ collection: value });
		feathers_app.service('fields').patch(this.props.params.field, {collectionReference:value.value}).catch(console.error);
		this.loadFields(value.value);
	}
	handleSelectChange(property, value) {
		let s = {};
		if (value != null) s[property] = value.value;
		else s[property] = value;
		this.setState(s);
		feathers_app.service('fields').patch(this.props.params.field, s).catch(console.error);
	}
	handleDefaultChange(event) {
		let s = { default: event.target.value };
		feathers_app.service('fields').patch(this.props.params.field, s).catch(console.error);
	}
	handleChange(event) {
		let s = {};
		s[event.target.id] = event.target.value;
		this.setState(s);
	}
	commitChange(event) {
		let s = {};
		s[event.target.id] = event.target.value;
		feathers_app.service('fields').patch(this.props.params.field, s).catch(console.error);
	}
	handleDeleteClick() {
		if (!confirm('Are you sure?')) return;
		feathers_app.service('fields').remove(this.props.params.field).catch(console.error);
		this.returnToCollection();
	}
	handlePatchedField(field) {
		if (field._id == this.state._id) {
			this.setState(field);
		}
	}
	returnToCollection(event) {
		if (event) event.preventDefault();
		this.props.router.push('/workspace/'+this.props.params.workspace+'/collection/'+this.props.params.collection);
	}
	componentDidMount() {
		this.loadField();
		this.loadCollections();
		this.fieldPatchedListener = this.handlePatchedField.bind(this);
		feathers_app.service('fields').on('patched', this.fieldPatchedListener);
	}
	componentWillUnmount() {
		feathers_app.service('fields').removeListener('patched', this.fieldPatchedListener);
	}
	render() {
		let that = this,
			field = this.state,
			typeOptions = [], optionOptions = [];
		for (let t in fieldTypes) {
			typeOptions.push({value:t, label:t});
		}
		for (let o of field.options) {
			optionOptions.push({value:o, label:o});
		}
		let FieldComponent = (field.type)?
			fieldTypes[field.type].component: fieldTypes['Static'].component;

		let collectionReferenceOption;
		for (let o of this.state.collectionOptions) {
			if (o.value == field.collectionReference) {
				collectionReferenceOption = o;
				break;
			}
		}
		let fieldReferenceOption;
		for (let o of this.state.fieldOptions) {
			if (o.value == field.fieldReference) {
				fieldReferenceOption = o;
				break;
			}
		}

		return (
			<Modal isOpen={true} contentLabel="configurefield">
				<div className="modalContent">
					<MessageBanner ref="messageBanner" />
					<button
						className="pure-button button-small"
						onClick={this.returnToCollection.bind(this)}>
						<i className="fa fa-close" />
					</button>
					<form className="pure-form pure-form-aligned" onSubmit={this.returnToCollection.bind(this)}>
						<fieldset>
							<div className="pure-control-group">
								<label htmlFor="name">Name</label>
								<input id="name"
									type="text"
									value={field.name}
									onChange={this.handleChange.bind(this)}
									onBlur={this.commitChange.bind(this)} />
							</div>
							<div className="pure-control-group">
								<label htmlFor="type">Type</label>
								<Select
									id="type"
									value={field.type}
									options={typeOptions}
									clearable={false}
									onChange={this.handleSelectChange.bind(this, 'type')} />
							</div>
							{field.type && field.type.indexOf('Select') != -1 &&
								<div className="pure-control-group">
									<label htmlFor="options">Options</label>
									<Select.Creatable
										id="options"
										value={optionOptions}
										options={[]}
										multi={true}
										onChange={this.handleOptionsSelectChange.bind(this, 'options')} />
								</div>
							}
							{field.type && field.type.indexOf('Field Reference') != -1 &&
								<div>
									<div className="pure-control-group">
										<label htmlFor="collection">Collection</label>
										<Select
											value={collectionReferenceOption}
											options={this.state.collectionOptions}
											onChange={this.handleSelectCollection.bind(this)} />
									</div>
									<div className="pure-control-group">
										<label htmlFor="field">Field</label>
										<Select
											value={fieldReferenceOption}
											options={field.fieldOptions}
											onChange={this.handleOptionsSelectChange.bind(this, 'fieldReference')} />
									</div>
								</div>
							}
							{field.type && field.type.indexOf('Reference') == -1 &&
								<div className="pure-control-group">
									<label htmlFor="default">Default Value</label>
									<FieldComponent
										clearable={true}
										fieldType={field.type}
										value={field.default}
										options={field.options}
										onCommitChange={this.handleDefaultChange.bind(this)} />
								</div>
							}
						</fieldset>
					</form>
					<button className="pure-button button-error"
						onClick={this.handleDeleteClick.bind(this)}>
						Delete Field
					</button>
				</div>
			</Modal>
		);
	}
}

module.exports = withRouter(ConfigureField);