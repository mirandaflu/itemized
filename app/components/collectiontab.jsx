import React from 'react';
import Modal from 'react-modal';
import Select from 'react-select';
import { Link } from 'react-router';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

import collectionViews from '../components/collectionviews/index.js';

export default class CollectionTab extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			fields: [],
			name: this.props.collection.name,
			viewType: this.props.collection.viewType,
			boardField: this.props.collection.boardField,
			cardField: this.props.collection.cardField,
			modalOpen: false
		};
	}
	getFields(collection) {
		feathers_app.service('fields').find({query:{coll:collection}})
			.then(result => { this.setState({fields: result}); })
			.catch(console.error);
	}
	startCollectionEdit(e) {
		e.preventDefault();
		this.setState({ modalOpen: true });
		this.getFields(this.props.collection);
	}
	handleSelectChange(property, value) {
		let s = {};
		s[property] = value.value;
		this.setState(s);
		this.props.onChange(this.props.collection._id, s);
	}
	handleChange(e) {
		let s = {};
		s[e.target.id] = e.target.value;
		this.setState(s);
	}
	commitChange(e) {
		let s = {};
		s[e.target.id] = e.target.value;
		this.props.onChange(this.props.collection._id, s);
	}
	handleDeleteClick(e) {
		e.preventDefault();
		this.props.onDelete(this.props.collection);
	}
	closeModal() {
		this.setState({ modalOpen: false });
	}
	render() {
		let collection = this.props.collection, that = this;
		let viewOptions = [];
		for (let o in collectionViews) {
			viewOptions.push({'value':o, 'label':o});
		}
		let boardOptions = this.state.fields
			.filter(function(field) { return field.type == 'Single Select'; })
			.map(function(field) { return {value: field._id, label: field.name}; });
		let cardOptions = this.state.fields
			.map(function(field) { return {value: field._id, label: field.name}; });
		return (
			<li className={(collection._id == this.props.activeCollectionId)?'pure-menu-item pure-menu-selected':'pure-menu-item'} style={{height:this.props.height}}>
				<Link to={'/workspace/'+this.props.workspace._id+'/collection/'+collection._id}>
					<div className="pure-menu-link" title={collection._id}>
						<ContextMenuTrigger id={'collection'+collection._id}>
							{collection.name}
						</ContextMenuTrigger>
						<ContextMenu id={'collection'+collection._id}>
							<MenuItem onClick={this.startCollectionEdit.bind(this)}>
								Edit
							</MenuItem>
							{collection.position != this.props.collectionsLength-1 &&
								<MenuItem data={{move:'right', collection: collection}} onClick={this.props.onMove}>
									Move Right
								</MenuItem>
							}
							{collection.position != 0 &&
								<MenuItem data={{move:'left', collection: collection}} onClick={this.props.onMove}>
									Move Left
								</MenuItem>
							}
						</ContextMenu>
					</div>
				</Link>
				<Modal
					isOpen={this.state.modalOpen}
					contentLabel="Modal">
					<div className="modalContent">

						<button onClick={this.closeModal.bind(this)}><i className="fa fa-close" /></button>
						<form className="pure-form pure-form-aligned">
							<fieldset>
								{[{name:'Name', stateVar:'name'}].map(function(property) {
									return (
										<div key={property.stateVar} className="pure-control-group">
											<label htmlFor={property.stateVar}>{property.name}</label>
											<input id={property.stateVar}
												type="text"
												value={that.state[property.stateVar]}
												onChange={that.handleChange.bind(that)}
												onBlur={that.commitChange.bind(that)} />
										</div>
									);
								})}
								<div className="pure-control-group">
									<label htmlFor="viewType">View</label>
									<Select
										id="viewType"
										value={this.state.viewType}
										options={viewOptions}
										clearable={false}
										onChange={this.handleSelectChange.bind(this, 'viewType')} />
								</div>
								{this.state.viewType == 'Board' &&
									<div className="pure-control-group">
										<label htmlFor="boardField">Board Field</label>
										<Select
											id="boardField"
											value={this.state.boardField}
											options={boardOptions}
											clearable={false}
											onChange={this.handleSelectChange.bind(this, 'boardField')} />
									</div>
								}
								{this.state.viewType == 'Board' &&
									<div className="pure-control-group">
										<label htmlFor="cardField">Card Field</label>
										<Select
											id="cardField"
											value={this.state.cardField}
											options={cardOptions}
											clearable={false}
											onChange={this.handleSelectChange.bind(this, 'cardField')} />
									</div>
								}
								<div className="pure-controls">
									<button className="pure-button button-error"
										onClick={this.handleDeleteClick.bind(this)}>
										Delete Collection
									</button>
								</div>
							</fieldset>
						</form>

					</div>
				</Modal>
			</li>
		);
	}
}
