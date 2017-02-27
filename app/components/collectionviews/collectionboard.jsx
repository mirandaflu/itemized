import React from 'react';
import { Link, withRouter } from 'react-router';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import interact from 'interact.js';

import fieldTypes from '../attributes/index.js';
import StatusText from '../statustext.jsx';

class CollectionBoard extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			attributesObject: this.props.attributesObject,
			dragging: null,
			dragID: null
		};
	}
	componentWillReceiveProps(nextProps) {
		this.setState({attributesObject:nextProps.attributesObject});
	}
	componentDidMount() {
		interact('#board .card').draggable({
			autoScroll: true,
			onstart: this._handleCardDragStart.bind(this),
			onmove: this._handleCardMove.bind(this),
			onend: this._handleDragEnd.bind(this)
		});
		interact('#board .dropzone').dropzone({
			accept: '.card',
			ondragenter: this._handleCardOverList.bind(this),
			ondrop: this._handleCardDroppedOnList.bind(this)
		});
	}
	render() {
		let that = this;
		let boardField = null;
		for (let i in this.props.fields) {
			if (this.props.fields[i]._id == this.props.collection.boardField) {
				boardField = this.props.fields[i];
			}
		}
		let attributesObject = this.state.attributesObject;
		return (
			<div id="board" ref="board" className="pure-g">
				<div ref="placeholder"
					style={{display:'none', fontFamily: "'Open Sans', sans-serif"}}
					className="card withshadow hovershadow pure-u-1 pure-u-sm-1-4 pure-u-md-1-5 pure-u-lg-1-6" />
				{boardField && boardField.options.map(function(option) {
					return (
						<div key={option} className="list medium-dark pure-u-1 pure-u-sm-1-4 pure-u-md-1-5 pure-u-lg-1-6">
							<h4>{option}</h4>
							<div data-option={option} className="dropzone">
								{that.props.things.map(function(thing) {
									if (!attributesObject[thing._id + boardField._id]) return;
									if (attributesObject[thing._id + boardField._id].value == option) {
										let nameIndex = thing._id + that.props.collection.cardField,
											cardName = (attributesObject[nameIndex])?
												attributesObject[nameIndex].value:
												null;
										if (!cardName) return;
										let attributeIndex = thing._id + boardField._id,
											attributeID = attributesObject[attributeIndex]._id;
										return (
											<div className={'card withshadow hovershadow'+((attributeID == that.state.dragID)?' dragging':'')}
												data-attributeindex={attributeIndex}
												data-attributeid={attributeID}
												key={thing._id + that.props.collection.cardField}>

												{cardName}

											</div>
										);
									}
								})}
							</div>
						</div>
					);
				})}
			</div>
		);
	}
	_handleCardDragStart(event) {
		this.setState({dragID:event.target.dataset.attributeid});
		this.refs.placeholder.innerHTML = event.target.innerHTML;
	}
	_handleCardMove(event) {
		const x = event.clientX,
			y = event.clientY,
			draggedEl = this.refs.placeholder;
		draggedEl.style.display = 'block';
		draggedEl.style.position = 'absolute';
		draggedEl.style.top = '0px';
		draggedEl.style.left = '0px';
		draggedEl.style.WebkitTransition = draggedEl.style.transition = 'none';
		draggedEl.style.webkitTransform = draggedEl.style.transform =
			draggedEl.style.msTransform = 'translate(' + x + 'px, ' + y + 'px)';
	}
	_handleCardOverList(event) {
		let aO = Object.assign(this.state.attributesObject);
		aO[event.relatedTarget.dataset.attributeindex].value = event.target.dataset.option;
		this.setState({attributesObject:aO})
	}
	_handleCardDroppedOnList(event) {
		feathers_app.service('attributes')
			.patch(event.relatedTarget.dataset.attributeid, {value:event.target.dataset.option})
			.then(result => {
				this.setState({
					dragging: null,
					dragID: null
				});
			})
			.catch(console.error);
	}
	_handleDragEnd(event) {
		this.refs.placeholder.style.display = 'none';
		this.setState({
			dragging: null,
			dragID: null
		});
	}
}

module.exports = withRouter(CollectionBoard);
