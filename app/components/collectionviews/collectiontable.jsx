import React from 'react';
import Select from 'react-select';
import { Link } from 'react-router';

import fieldTypes from '../attributes/index.js';
import StatusText from '../statustext.jsx';
import FilterMaker from './filtermaker.jsx';

export default class CollectionTable extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			clickedAttribute: this.props.clickedAttribute
		};
	}
	forwardAttributeClick(attribute) {
		if (this.props.onAttributeClick) {
			this.props.onAttributeClick(attribute);
		}
	}
	componentWillReceiveProps(nextProps) {
		this.setState({ clickedAttribute: nextProps.clickedAttribute });
	}
	render() {
		let that = this;
		let things = this.props.things,
			fields = this.props.fields,
			attributes = this.props.attributesObject;

		return (
			<div>
				<table className="pure-table animated fadeIn">
					<thead>
						<tr>
							{!this.props.onlyForSelectingReference && <th></th>}
							{fields.map(function(field){
								return(
									<th key={field._id}>
										<Link to={'/workspace/'+that.props.collection.workspace+'/collection/'+that.props.collection._id+'/field/'+field._id}>
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
						{things.map(function(thing){
							return(
								<tr key={thing._id}>
									{!that.props.onlyForSelectingReference && 
										<td>
											<Link to={'/workspace/'+that.props.collection.workspace+'/collection/'+that.props.collection._id+'/thing/'+thing._id}>
												<i className="fa fa-expand" />
											</Link>
										</td>
									}
									{fields.map(function(field){
										let value = '', attribute = null, style = {},
											FieldComponent = fieldTypes[field.type].component;
										if (that.props.attributesObject[thing._id + field._id]) {
											attribute = that.props.attributesObject[thing._id + field._id];
											value = attribute.value;
										}
										let rowSpan = 1;
										if (that.props.group && that.props.group.value == field._id) {
											if (thing.rowSpan > 0) {
												rowSpan = thing.rowSpan;
												FieldComponent = fieldTypes['Static'].component;
												style = {textAlign:'center'};
											}
											else return null;
										}
										if (that.props.readOnly) {
											FieldComponent = fieldTypes['Static'].component;
										}
										if (that.state.clickedAttribute != null && attribute != null &&
										that.state.clickedAttribute == attribute._id) {
											style.backgroundColor = 'lightgrey';
										}
										return (
											<td className="cell" style={style} rowSpan={rowSpan} key={thing._id + field._id}
												onClick={that.forwardAttributeClick.bind(that, attribute)}>
												<FieldComponent
													clearable={true}
													fieldType={field.type}
													workspace={that.props.collection.workspace}
													collection={that.props.collection._id}
													thing={thing._id}
													field={field._id}
													attribute={attribute}
													value={value}
													options={field.options}
													onCreateOption={that.props.onCreateOption && that.props.onCreateOption.bind(that, field._id)}
													onCommitChange={that.props.onCommitValueChange && that.props.onCommitValueChange.bind(that, thing._id, field._id, attribute)} />
											</td>
										);
									})}
								</tr>
							);
						})}
					</tbody>
				</table>
				{!this.props.onlyForSelectingReference &&
					<button className="pure-button button-secondary" style={{marginTop:'8px'}} onClick={this.props.onAddThing} disabled={this.props.readOnly}>
						Add Thing
					</button>
				}
				{this.props.children}
			</div>
		);
	}
}
