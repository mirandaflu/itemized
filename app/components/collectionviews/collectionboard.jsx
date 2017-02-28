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
			boardField: this.getBoardField(this.props),
			dragging: null,
			dragID: null
		};
	}
	addList() {
		let name = prompt('Name?');
		if (!name) return;
		feathers_app.service('fields')
			.patch(this.state.boardField._id, {options: this.state.boardField.options.concat(name)})
			.catch(console.error);
	}
	getBoardField(props) {
		let boardField = null;
		for (let i in props.fields) {
			if (props.fields[i]._id == props.collection.boardField) {
				boardField = props.fields[i];
			}
		}
		return boardField;
	}
	componentWillReceiveProps(nextProps) {
		this.setState({
			attributesObject: nextProps.attributesObject,
			boardField: this.getBoardField(nextProps)
		});
	}
	componentDidMount() {
		interact('#board .list').draggable({
			autoScroll: true,
			onstart: this._handleListDragStart.bind(this),
			onmove: this._handleListMove.bind(this),
			onend: this._handleDragEnd.bind(this)
		});
		interact('#board .listdropzone').dropzone({
			accept: '.list',
			ondragenter: this._handleListOverList.bind(this),
			ondrop: this._handleListDroppedOnList.bind(this)
		});
		interact('#board .card').draggable({
			autoScroll: true,
			onstart: this._handleCardDragStart.bind(this),
			onmove: this._handleCardMove.bind(this),
			onend: this._handleDragEnd.bind(this)
		});
		interact('#board .carddropzone').dropzone({
			accept: '.card',
			ondragenter: this._handleCardOverList.bind(this),
			ondrop: this._handleCardDroppedOnList.bind(this)
		});
	}
	render() {
		let that = this,
			boardField = this.state.boardField,
			attributesObject = this.state.attributesObject;

		return (
			<div id="board" ref="board" className="pure-g">
				<div ref="cardplaceholder"
					style={{display:'none', fontFamily: "'Open Sans', sans-serif"}}
					className="card withshadow hovershadow pure-u-1 pure-u-sm-1-4 pure-u-md-1-5 pure-u-lg-1-6" />
				<div ref="listplaceholder"
					style={{display:'none'}}
					className="list medium-dark pure-u-1 pure-u-sm-1-4 pure-u-md-1-5 pure-u-lg-1-6">
					<h4>ph</h4>
				</div>
				{boardField && boardField.options.map(function(option, index) {
					return (
						<div key={option}
							data-optionname={option}
							data-optionindex={index}
							className={'list listdropzone medium-dark pure-u-1 pure-u-sm-1-4 pure-u-md-1-5 pure-u-lg-1-6'
								+(('option'+option == that.state.dragID)?' dragging':'')}>
							
							<h4>{option}</h4>
							<div data-option={option} className="carddropzone">
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
											<div
												className={'card withshadow hovershadow'
													+((attributeID == that.state.dragID)?' dragging':'')}
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
				<div className="list pure-u-1 pure-u-sm-1-4 pure-u-md-1-5 pure-u-lg-1-6">
					<button className="pure-button button-secondary" onClick={this.addList.bind(this)}>
						<i className="fa fa-plus" /> Add List
					</button>
				</div>
			</div>
		);
	}
	_handleListDragStart(event) {
		this.setState({dragID:'option'+event.target.dataset.optionname});
		this.refs.listplaceholder.firstChild.innerHTML = event.target.firstChild.innerHTML;
	}
	_handleListMove(event) {
		const x = event.clientX,
			y = event.clientY,
			draggedEl = this.refs.listplaceholder;
		draggedEl.style.display = 'block';
		draggedEl.style.position = 'absolute';
		draggedEl.style.top = '0px';
		draggedEl.style.left = '0px';
		draggedEl.style.WebkitTransition = draggedEl.style.transition = 'none';
		draggedEl.style.webkitTransform = draggedEl.style.transform =
			draggedEl.style.msTransform = 'translate(' + x + 'px, ' + y + 'px)';
	}
	_handleListOverList(event) {
		let bF = Object.assign(this.state.boardField);
		let opt = bF.options.splice(parseInt(event.target.dataset.optionindex), 1);
		bF.options.splice(event.relatedTarget.dataset.optionindex,0,opt[0]);
		this.setState({boardField:bF});
	}
	_handleListDroppedOnList(event) {
		feathers_app.service('fields')
			.patch(this.state.boardField._id, {options: this.state.boardField.options})
			.catch(console.error);
	}
	_handleCardDragStart(event) {
		this.setState({dragID:event.target.dataset.attributeid});
		this.refs.cardplaceholder.innerHTML = event.target.innerHTML;
	}
	_handleCardMove(event) {
		const x = event.clientX,
			y = event.clientY,
			draggedEl = this.refs.cardplaceholder;
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
		this.setState({attributesObject:aO});
	}
	_handleCardDroppedOnList(event) {
		feathers_app.service('attributes')
			.patch(event.relatedTarget.dataset.attributeid, {value:event.target.dataset.option})
			.catch(console.error);
	}
	_handleDragEnd(event) {
		this.refs.cardplaceholder.style.display = 'none';
		this.refs.listplaceholder.style.display = 'none';
		this.setState({
			dragging: null,
			dragID: null
		});
	}
}

module.exports = withRouter(CollectionBoard);
