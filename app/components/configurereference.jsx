import React from 'react';
import Modal from 'react-modal';
import Select from 'react-select';
import { withRouter } from 'react-router';

import MessageBanner from 'components/messagebanner';
import CollectionTable from 'components/collectionviews/collectiontable';

class ConfigureReference extends React.Component {
	state = {
		collections: [],
		collection: null,
		things: [],
		thing: null,
		fields: [],
		field: null,
		attributes: [],
		attribute: {},
		referencedValue: null
	}
	loadData = () => {
		feathersApp.service('attributes').find({query: {
			coll: this.props.params.collection,
			thing: this.props.params.thing,
			field: this.props.params.field
		}}).then(attributes => {
			if (attributes.length === 0) {
				feathersApp.service('collections').find({query: {workspace: this.props.params.workspace}})
					.then(collections => {
						this.setState({ collections: collections.map(collection => {
							return {
								label: collection.name,
								value: collection
							};
						})});
					}).catch(console.error);
			} else {
				this.setState({ attribute: attributes[0] });
				feathersApp.service('attributes').find({query: {_id: attributes[0].value}})
					.then(referencedAttributes => {
						const referencedAttribute = referencedAttributes[0];
						let referencedCollection = null;
						if (referencedAttribute) {
							this.setState({ referencedValue: referencedAttribute.value });
							referencedCollection = referencedAttribute.coll;
						}
						feathersApp.service('collections').find({query: {workspace: this.props.params.workspace}})
							.then(collections => {
								this.setState({ collections: collections.map(collection => {
									return {
										label: collection.name,
										value: collection
									};
								})});
								for (const c of collections) {
									if (c._id === referencedCollection) {
										const collectionOption = {
											label: c.name,
											value: c
										};
										this.setState({ collection: collectionOption });
										this.handleSelectChange('collection', collectionOption);
										break;
									}
								}
							}).catch(console.error);
					}).catch(console.error);
			}
		}).catch(console.error);
	}
	loadFields = (collection) => {
		feathersApp.service('fields').find({query: {coll: collection}}).then(fields => {
			this.setState({
				fields: fields.filter(field => { return field.type !== 'Attribute Reference'; })
			});
		}).catch(console.error);
	}
	loadThings = (collection) => {
		feathersApp.service('things').find({query: {coll: collection}})
			.then(things => { this.setState({ things: things.data }); })
			.catch(console.error);
	}
	loadAttributes = (collection) => {
		feathersApp.service('attributes').find({query: {coll: collection}})
			.then(attributes => { this.setState({ attributes: attributes }); })
			.catch(console.error);
	}
	handleSelectChange = (key, value) => {
		if (key === 'collection' && value !== null) {
			this.loadFields(value.value);
			this.loadThings(value.value);
			this.loadAttributes(value.value);
		}
		const s = {};
		s[key] = value;
		this.setState(s);
	}
	handleAttributeClick = (attribute) => {
		this.setState({ referencedValue: attribute.value });
		const query = {
			coll: this.props.params.collection,
			thing: this.props.params.thing,
			field: this.props.params.field
		};
		feathersApp.service('attributes')
			.patch(null, {value: attribute._id}, {query: query})
			.catch(console.error)
			.then(attributes => { this.setState({ attribute: attributes[0] }); });
	}
	clearReference = () => {
		feathersApp.service('attributes').remove(this.state.attribute._id)
			.then(result => { this.returnToCollection(); })
			.catch(console.error);
	}
	returnToCollection = (event) => {
		if (event) event.preventDefault();
		this.props.router.push('/workspace/' + this.props.params.workspace + '/collection/' + this.props.params.collection);
	}
	componentDidMount() {
		this.loadData();
	}
	render() {
		const attributesObject = {};
		for (const attr of this.state.attributes) {
			attributesObject[attr.thing + attr.field] = attr;
		}
		return (
			<Modal isOpen contentLabel="configurereference">
				<div className="modalContent">
					<MessageBanner ref="messageBanner" />
					<button
						className="pure-button button-small"
						onClick={this.returnToCollection}>
						<i className="fa fa-close" />
					</button>
					<form className="pure-form pure-form-aligned" onSubmit={this.returnToCollection}>
						<fieldset>
							<div className="pure-control-group">
								<label htmlFor="type">Collection</label>
								<Select
									id="collection"
									value={this.state.collection}
									options={this.state.collections}
									onChange={this.handleSelectChange.bind(this, 'collection')} />
							</div>
							{this.state.fields && this.state.things && this.state.collection && this.state.collection.value &&
								<CollectionTable
									readOnly
									onlyForSelectingReference
									clickedAttribute={this.state.attribute.value}
									collection={this.state.collection.value}
									fields={this.state.fields}
									things={this.state.things}
									attributesObject={attributesObject}
									onAttributeClick={this.handleAttributeClick} />
							}
							<div className="pure-control-group">
								<label htmlFor="type">Value</label>
								<input placeholder={(!this.state.collection) ? 'Select a collection...' : '... and click an attribute'}
									value={this.state.referencedValue} disabled />
							</div>
						</fieldset>
					</form>
					<button className="pure-button" onClick={this.clearReference}>Clear Reference</button>
				</div>
			</Modal>
		);
	}
}

module.exports = withRouter(ConfigureReference);
