import React from 'react';
import { Link } from 'react-router';

import fieldTypes from '../attributes/index.js';

export default class CollectionTable extends React.Component {
	state = { clickedAttribute: this.props.clickedAttribute }
	forwardAttributeClick = (attribute) => {
		if (this.props.onAttributeClick) {
			this.props.onAttributeClick(attribute);
		}
	}
	componentWillReceiveProps(nextProps) {
		this.setState({ clickedAttribute: nextProps.clickedAttribute });
	}
	render() {
		const that = this;
		const things = this.props.things;
		const fields = this.props.fields;
		const attributes = this.props.attributesObject;

		return (
			<div>
				<table className="pure-table animated fadeIn">
					<thead>
						<tr>
							{!this.props.onlyForSelectingReference && <th />}
							{fields.map(field => {
								return (
									<th key={field._id}>
										<Link to={'/workspace/' + that.props.collection.workspace + '/collection/' + that.props.collection._id + '/field/' + field._id}>
											{field.name}
										</Link>
									</th>
								);
							})}
							{!this.props.onlyForSelectingReference &&
								<th>
									<button className="pure-button button-secondary" onClick={this.props.onCreateField} disabled={this.props.readOnly}>
										Add Field
									</button>
								</th>
							}
						</tr>
					</thead>
					<tbody>
						{things.map(thing => {
							return (
								<tr key={thing._id}>
									{!this.props.onlyForSelectingReference &&
										<td>
											<Link to={'/workspace/' + this.props.collection.workspace + '/collection/' + that.props.collection._id + '/thing/' + thing._id}>
												<i className="fa fa-expand" />
											</Link>
										</td>
									}
									{fields.map(field => {
										let value = '';
										let attribute = null;
										let style = {};
										let FieldComponent = fieldTypes[field.type].component;
										if (attributes[thing._id + field._id]) {
											attribute = attributes[thing._id + field._id];
											value = attribute.value;
										}
										let rowSpan = 1;
										if (this.props.group && this.props.group.value === field._id) {
											if (thing.rowSpan > 0) {
												rowSpan = thing.rowSpan;
												FieldComponent = fieldTypes.Static.component;
												style = {textAlign: 'center'};
											} else return null;
										}
										if (this.props.readOnly) {
											FieldComponent = fieldTypes.Static.component;
										}
										if (this.state.clickedAttribute !== null && attribute !== null &&
										this.state.clickedAttribute === attribute._id) {
											style.backgroundColor = 'lightgrey';
										}
										return (
											<td className="cell" style={style} rowSpan={rowSpan} key={thing._id + field._id}
												onClick={this.forwardAttributeClick.bind(this, attribute)}>
												<FieldComponent
													clearable
													fieldType={field.type}
													workspace={this.props.collection.workspace}
													collection={this.props.collection._id}
													thing={thing._id}
													field={field._id}
													attribute={attribute}
													value={value}
													options={field.options}
													onCreateOption={this.props.onCreateOption && that.props.onCreateOption.bind(that, field._id)}
													onCommitChange={this.props.onCommitValueChange && that.props.onCommitValueChange.bind(that, thing._id, field._id, attribute)} />
											</td>
										);
									})}
								</tr>
							);
						})}
					</tbody>
				</table>
				{!this.props.onlyForSelectingReference &&
					<button className="pure-button button-secondary" style={{marginTop: '8px'}} onClick={this.props.onAddThing} disabled={this.props.readOnly}>
						Add Thing
					</button>
				}
				{this.props.children}
			</div>
		);
	}
}
