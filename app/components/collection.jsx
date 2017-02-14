import React from 'react';
import { Link, withRouter } from 'react-router';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

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
		let field = {
			name: name,
			coll: this.state.id
		};
		feathers_app.service('fields').create(field).then(result => {
			this.setState({fields: this.state.fields.concat(result)});
		});
	}
	removeField(e, data) {
		if (!confirm('Are you sure?')) return;
		feathers_app.service('fields').remove(data.deleteID).then(result => {
			for (let i in this.state.fields) {
				if (this.state.fields[i]._id == data.deleteID) {
					let newFields = this.state.fields;
					newFields.splice(i, 1)
					this.setState({ fields: newFields });
					break;
				}
			}
		});
	}
	addThing() {
		let thing = {
			coll: this.state.id
		};
		feathers_app.service('things').create(thing).then(result => {
			this.setState({things: this.state.things.concat(result)});
		});
	}
	removeThing(e, data) {
		if (!confirm('Are you sure?')) return;
		feathers_app.service('things').remove(data.deleteID).then(result => {
			for (let i in this.state.things) {
				if (this.state.things[i]._id == data.deleteID) {
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
		feathers_app.service('fields').find({query: {coll: collection}})
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
			<div>
				<h3>Collection {this.state.id}</h3>
				<table className="pure-table">
					<thead>
						<tr>
							<th>=</th>
							{this.state.fields.map(function(field){
								return(
									<th key={field._id}>
										<ContextMenuTrigger id={'field'+field._id}>
											{field.name}
										</ContextMenuTrigger>
										<ContextMenu id={'field'+field._id}>
											<MenuItem data={{deleteID: field._id}} onClick={that.removeField.bind(that)}>
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
											[thing]
										</ContextMenuTrigger>
										<ContextMenu id={'thing'+thing._id}>
											<MenuItem data={{deleteID: thing._id}} onClick={that.removeThing.bind(that)}>
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
						<tr><td>
							<button className="pure-button" onClick={this.addThing.bind(this)}>Add Thing</button>
						</td></tr>
					</tbody>
				</table>
			</div>
		);
	}
}

module.exports = withRouter(Collection);
