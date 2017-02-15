import React from 'react';
import { Link, withRouter } from 'react-router';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

import { arrayWithElementsSwapped, arrayWithElementRemoved } from '../functions/arrayutilities.js';
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
	addField() {
		let name = prompt('Name?');
		if (!name) return;
		feathers_app.service('fields').create({
			name: name,
			coll: this.state.id,
			position: this.state.fields.length
		}).then(result => {
			this.setState({fields: this.state.fields.concat(result)});
		}).catch(console.error);
	}
	moveField(e, data) {
		let move = (data.move == 'right')? 1: -1;
		feathers_app.service('fields').patch(null, {$inc: {position: -move}}, {query: {
			coll: this.state.id,
			position: data.field.position + move
		}}).then(result => {
			feathers_app.service('fields').patch(data.field._id, {$inc: {position: move}}).then(result => {
				this.setState({
					fields: arrayWithElementsSwapped(this.state.fields, data.field.position, data.field.position + move)
				});
			}).catch(console.error);
		}).catch(console.error);
	}
	removeField(e, data) {
		if (!confirm('Are you sure?')) return;
		feathers_app.service('fields').remove(data.field._id).then(result => {
			this.setState({
				fields: arrayWithElementRemoved(this.state.fields, data.field._id)
			});
		});
	}
	addThing() {
		feathers_app.service('things').create({coll: this.state.id}).then(result => {
			this.setState({things: this.state.things.concat(result)});
		});
	}
	removeThing(e, data) {
		if (!confirm('Are you sure?')) return;
		feathers_app.service('things').remove(data.thing._id).then(result => {
			for (let i in this.state.things) {
				if (this.state.things[i]._id == data.thing._id) {
					let newThings = this.state.things;
					newThings.splice(i, 1)
					this.setState({ things: newThings });
					break;
				}
			}
		});
	}
	modifyValue(thingID, fieldID, attribute) {
		let value = prompt('Value?');
		let newAttribute = {
			coll: this.state.id,
			thing: thingID,
			field: fieldID,
			value: value
		};
		if (attribute && attribute._id) {
			feathers_app.service('attributes').patch(attribute._id, {value: value}).then(result => {
				let newAttributes = this.state.attributes;
				for (let attr of newAttributes) {
					if (attr._id == result._id) {
						attr.value = result.value;
					}
				}
				this.setState({
					attributes: newAttributes
				});
			});
		}
		else {
			feathers_app.service('attributes').create(newAttribute).then(result => {
				this.setState({
					attributes: this.state.attributes.concat(result)
				});
			});
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
	componentWillReceiveProps(nextProps) {
		this.setState({id: nextProps.routeParams.collection});
		this.loadData(nextProps.routeParams.collection);
	}
	componentDidMount() { this.loadData(); }
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
											<MenuItem data={{field: field}} onClick={that.removeField.bind(that)}>
												Delete Field
											</MenuItem>
										</ContextMenu>
									</th>
								);
							})}
							<th>
								<button className="pure-button" onClick={this.addField.bind(this)}>Add Field</button>
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
										return (
											<td key={thing._id + field._id} onClick={that.modifyValue.bind(that, thing._id, field._id, attribute)}>{value}</td>
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
