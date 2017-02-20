import React from 'react';
import { Link, withRouter } from 'react-router';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

import fieldTypes from '../attributes/index.js';
import StatusText from '../statustext.jsx';

class CollectionTable extends React.Component {
	render() {
		let that = this;
		return (
			<div className="workspace">
				<table className="pure-table">
					<thead>
						<tr>
							<th></th>
							{this.props.fields.map(function(field){
								return(
									<th key={field._id}>
										<ContextMenuTrigger id={'field'+field._id}>
											{field.name}
										</ContextMenuTrigger>
										<ContextMenu id={'field'+field._id}>
											<MenuItem data={{field: field}} onClick={that.props.onChangeFieldType}>
												Change Type
											</MenuItem>
											{field.type == 'Single Select' &&
												<MenuItem data={{field: field}} onClick={that.props.onAddFieldOption}>
													Add Option
												</MenuItem>
											}
											{field.position != that.props.fields.length-1 &&
												<MenuItem data={{move:'right', field: field}} onClick={that.props.onMoveField}>
													Move Right
												</MenuItem>
											}
											{field.position != 0 &&
												<MenuItem data={{move:'left', field: field}} onClick={that.props.onMoveField}>
													Move Left
												</MenuItem>
											}
											<MenuItem data={{field: field}} onClick={that.props.onRenameField}>
												Rename Field
											</MenuItem>
											<MenuItem data={{field: field}} onClick={that.props.onRemoveField}>
												Delete Field
											</MenuItem>
										</ContextMenu>
									</th>
								);
							})}
							<th>
								<button className="pure-button" onClick={this.props.onCreateField}>Add Field</button>
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
				<br />
				<button className="pure-button" onClick={this.props.onAddThing}>Add Thing</button>
			</div>
		);
	}
}

module.exports = withRouter(CollectionTable);
