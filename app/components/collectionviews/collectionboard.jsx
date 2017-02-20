import React from 'react';
import { Link, withRouter } from 'react-router';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

import fieldTypes from '../attributes/index.js';
import StatusText from '../statustext.jsx';

class CollectionBoard extends React.Component {
	render() {
		let that = this;
		let boardField = null;
		for (let i in this.props.fields) {
			if (this.props.fields[i]._id == this.props.collection.boardField) {
				boardField = this.props.fields[i];
			}
		}
		return (
			<div className="pure-g">
				{boardField && boardField.options.map(function(option) {
					return (
						<div key={option} className="pure-u-1 pure-u-sm-1-4 pure-u-md-1-5 pure-u-lg-1-6">
							<h4>{option}</h4>
							{that.props.things.map(function(thing) {
								if (!that.props.attributesObject[thing._id + boardField._id]) return;
								if (that.props.attributesObject[thing._id + boardField._id].value == option) {
									return (
										<div key={thing._id + that.props.collection.cardField} className="card withshadow">
											{that.props.attributesObject[thing._id + that.props.collection.cardField].value}
										</div>
									);
								}
							})}
						</div>
					);
				})}

			</div>
		);
	}
}

module.exports = withRouter(CollectionBoard);
