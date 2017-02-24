import React from 'react';
import { Link, withRouter } from 'react-router';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';

import fieldTypes from '../attributes/index.js';
import StatusText from '../statustext.jsx';
import FieldHeader from './fieldheader.jsx';

class CollectionTable extends React.Component {
	render() {
		let that = this;
		return (
			<div>
				<table className="pure-table">
					<thead>
						<tr>
							<th></th>
							{this.props.fields.map(function(field){
								return(
									<th key={field._id}>
										<FieldHeader
											fieldsLength={that.props.fields.length}
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
						{this.props.things.map(function(thing){
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
									{that.props.fields.map(function(field){
										let value = '', attribute = null;
										if (that.props.attributesObject[thing._id + field._id]) {
											attribute = that.props.attributesObject[thing._id + field._id];
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

module.exports = withRouter(CollectionTable);
