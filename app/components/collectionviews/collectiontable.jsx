import React from 'react';
import Select from 'react-select';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';

import fieldTypes from '../attributes/index.js';
import StatusText from '../statustext.jsx';
import FieldHeader from './fieldheader.jsx';
import FilterMaker from './filtermaker.jsx';

export default class CollectionTable extends React.Component {
	render() {
		let that = this;
		let things = this.props.things,
			fields = this.props.fields,
			attributes = this.props.attributesObject;

		return (
			<div style={{width:'100%', overflowX:'auto', overflowY:'visible'}}>
				<table className="pure-table animated fadeIn">
					<thead>
						<tr>
							<th></th>
							{fields.map(function(field){
								return(
									<th key={field._id}>
										<FieldHeader
											fieldsLength={fields.length}
											field={field}
											onMove={that.props.onMoveField} />
									</th>
								);
							})}
							<th>
								<button className="pure-button button-secondary" onClick={this.props.onCreateField}>Add Field</button>
							</th>
						</tr>
					</thead>
					<tbody>
						{things.map(function(thing){
							return(
								<tr key={thing._id}>
									<td>
										<ContextMenuTrigger id={'thing'+thing._id}>
											=
										</ContextMenuTrigger>
										<ContextMenu id={'thing'+thing._id}>
											<MenuItem data={{thing: thing}} onClick={that.props.onRemoveThing}>
												Delete Thing
											</MenuItem>
										</ContextMenu>
									</td>
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
										return (
											<td className="cell" style={style} rowSpan={rowSpan} key={thing._id + field._id}>
												<FieldComponent
													fieldType={field.type}
													attribute={attribute}
													value={value}
													options={field.options}
													onCreateOption={that.props.onCreateOption.bind(that, field._id)}
													onCommitChange={that.props.onCommitValueChange.bind(that, thing._id, field._id, attribute)} />
											</td>
										);
									})}
								</tr>
							);
						})}
					</tbody>
				</table>
				<button className="pure-button button-secondary" style={{marginTop:'8px'}} onClick={this.props.onAddThing}>Add Thing</button>
			</div>
		);
	}
}
