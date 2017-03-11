import React from 'react';
import { Link, withRouter } from 'react-router';
import interact from 'interact.js';

import fieldTypes from '../attributes/index.js';
import StatusText from '../statustext.jsx';

class CollectionBoard extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			things: this.props.things,
			attributesObject: this.props.attributesObject,
			boardField: this.getField(this.props, this.props.collection.boardField),
			swimLane: this.getField(this.props, this.props.collection.swimLane),
			dragging: null,
			dragID: null,
			dragStartX: 0,
			dragStartY: 0
		};
	}
	addList() {
		let name = prompt('Name?');
		if (!name) return;
		feathers_app.service('fields')
			.patch(this.state.boardField._id, {options: this.state.boardField.options.concat(name)})
			.catch(console.error);
	}
	setUpDragDrop() {
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
		interact('#board .listheader').dropzone({
			accept: '.card',
			ondragenter: this._handleCardOverListHeader.bind(this)
		});
		interact('#board .listfooter').dropzone({
			accept: '.card',
			ondragenter: this._handleCardOverListFooter.bind(this)
		});
		interact('#board .card').dropzone({
			accept: '.card',
			ondragenter: this._handleCardOverCard.bind(this)
		});
	}
	setListPositions(props, things) {
		things = Object.assign(things);
		let boardField = this.getField(props, props.collection.boardField),
			attributesObject = props.attributesObject,
			needsUpdate = [];
		let listMapping = {};
		if (boardField) {
			boardField.options.map(function(option) {
				let i = 1;
				things.map(function(thing) {
					if (!attributesObject[thing._id + boardField._id]) return;
					if (attributesObject[thing._id + boardField._id].value == option) {
						let nameIndex = thing._id + props.collection.cardField,
							cardName = (attributesObject[nameIndex])?
								attributesObject[nameIndex].value:
								null;
						if (!cardName) return;
						let attributeIndex = thing._id + boardField._id,
							attributeID = attributesObject[attributeIndex]._id;
						listMapping[thing._id] = i;
						i += 1;
					}
				});
			});
			for (let id in listMapping) {
				feathers_app.service('things').patch(id, {listPosition:listMapping[id]})
					.catch(console.error);
			}
		}
	}
	addThing(event) {
		let cardFieldName = '', fields = this.props.fields;
		for (let i in fields) {
			if (fields[i]._id == this.props.collection.cardField) {
				cardFieldName = fields[i].name;
			}
		}
		let s = prompt(cardFieldName+'?');
		if (!s) return;

		let listvalue = event.target.dataset.listvalue,
			thing = {
			coll: this.props.collection._id,
			listPosition: this.props.things.length
		};
		feathers_app.service('things').create(thing).then(newThing => {
			let attr1 = {
				coll: this.props.collection._id,
				thing: newThing._id,
				field: this.props.collection.cardField,
				value: s
			}, attr2 = {
				coll: this.props.collection._id,
				thing: newThing._id,
				field: this.props.collection.boardField,
				value: listvalue
			};
			feathers_app.service('attributes').create(attr1).catch(console.error);
			feathers_app.service('attributes').create(attr2).catch(console.error);
		}).catch(console.error);
	}
	getField(props, id) {
		let field = null, sourceProp = 'fields';
		for (let i in props[sourceProp]) {
			if (props[sourceProp][i]._id == id) {
				field = props[sourceProp][i];
			}
		}
		return field;
	}
	componentWillReceiveProps(nextProps) {
		let things = nextProps.things;
		things.sort(function(a,b) { return a.listPosition - b.listPosition; });
		this.setState({
			attributesObject: nextProps.attributesObject,
			boardField: this.getField(nextProps, this.props.collection.boardField),
			things: things,
			swimLane: this.getField(nextProps, this.props.collection.swimLane)
		});
	}
	componentDidMount() {
		this.setUpDragDrop();
	}
	render() {
		let that = this,
			boardField = this.state.boardField,
			attributesObject = this.state.attributesObject,
			things = this.state.things,
			swimLane = this.state.swimLane;

		let renderBoardNodes = (options = {}) => {
			return (option, index) => {
				let i = -1;
				return (
					<div key={option + options.swimLaneOption}
						data-optionname={option}
						data-optionindex={index}
						className={'list listdropzone medium-dark pure-u-1 pure-u-sm-1-4 pure-u-md-1-5 pure-u-lg-1-6'
							+(('option'+option == that.state.dragID)?' dragging':'')}>
						
						<h4 className="listheader">{option}</h4>
						<div data-option={option} data-swimlane={options.swimLaneOption} className="carddropzone">
							{things.map(function(thing) {
								if (!attributesObject[thing._id + boardField._id]) return;
								if (attributesObject[thing._id + boardField._id].value == option &&
								(!options.swimLane || attributesObject[thing._id + swimLane._id].value == options.swimLaneOption)) {
									let nameIndex = thing._id + that.props.collection.cardField,
										cardName = (attributesObject[nameIndex])?
											attributesObject[nameIndex].value:
											null;
									if (!cardName) return;

									let attributeIndex = thing._id + boardField._id,
										attributeID = attributesObject[attributeIndex]._id;
									
									let SLattributeIndex = (!options.swimLane)? null: thing._id + options.swimLane._id,
										SLattributeID = (!options.swimLane)? null: (attributesObject[SLattributeIndex])? attributesObject[SLattributeIndex]._id: null;

									i += 1;
									return (
										<div
											className={'card withshadow hovershadow'
												+((attributeID == that.state.dragID)?' dragging':'')}
											data-attributeindex={attributeIndex}
											data-attributeid={attributeID}
											data-swimlaneattributeindex={SLattributeIndex}
											data-swimlaneattributeid={SLattributeID}
											data-thingid={thing._id}
											data-thingposition={i}
											data-listposition={thing.listPosition}
											key={thing._id + that.props.collection.cardField}>

											<Link style={{float:'right'}}
												to={'/workspace/'+that.props.collection.workspace+'/collection/'+that.props.collection._id+'/thing/'+thing._id}>
												<i className="fa fa-expand" style={{color:'grey'}} />
											</Link>

											{cardName}

										</div>
									);
								}
							})}
							<div style={{padding:'2px 4px'}}>
								<button className="pure-button button-small button-secondary"
									data-listvalue={option}
									style={{width:'100%'}}
									onClick={that.addThing.bind(that)}>
									<i className="fa fa-plus" />
								</button>
							</div>
						</div>
						<div className="listfooter" style={{width:'100%', height:'24px'}} />
					</div>
				);
			};
		};

		return (
			<div id="board" ref="board">
				<div ref="cardplaceholder"
					style={{display:'none', fontFamily: "'Open Sans', sans-serif"}}
					className="card withshadow hovershadow pure-u-1 pure-u-sm-1-4 pure-u-md-1-5 pure-u-lg-1-6" />
				<div ref="listplaceholder"
					style={{display:'none'}}
					className="list medium-dark pure-u-1 pure-u-sm-1-4 pure-u-md-1-5 pure-u-lg-1-6">
					<h4></h4>
				</div>
				{swimLane && swimLane.options.map(function(option, index) {
					return (
						<div key={option} className="pure-g">
							<div className="pure-u-1"><h4>{option}</h4></div>
							{boardField && boardField.options.map(renderBoardNodes({
								swimLane: swimLane,
								swimLaneOption: option
							}))}
						</div>
					);
				})}
				{!swimLane && boardField && boardField.options.map(renderBoardNodes())}
				<div className="list pure-u-1 pure-u-sm-1-4 pure-u-md-1-5 pure-u-lg-1-6">
					<button className="pure-button button-secondary" onClick={this.addList.bind(this)}>
						<i className="fa fa-plus" /> Add List
					</button>
				</div>
			</div>
		);
	}
	_setThingPosition(thing, position) {
		let things = Object.assign(this.state.thingsBeforeDragging);
		for (let i in things) {
			if (things[i]._id == thing) {
				things[i].listPosition = position;
			}
		}
		things.sort(function(a,b) { return a.listPosition - b.listPosition; });
		this.setState({things:things});
	}
	_handleElementMove(event, placeholder, extraTransform) {
		const x = event.clientX - this.state.dragStartX,
			y = event.clientY - this.state.dragStartY,
			draggedEl = placeholder;
		draggedEl.style.display = 'block';
		draggedEl.style.position = 'absolute';
		draggedEl.style.top = '0px';
		draggedEl.style.left = '0px';
		draggedEl.style.WebkitTransition = draggedEl.style.transition = 'transform 0.1s';
		let transform = 'translate(' + x + 'px, ' + y + 'px) ';
		if (extraTransform) transform += ' '+extraTransform;
		draggedEl.style.webkitTransform = draggedEl.style.transform =
			draggedEl.style.msTransform = transform;
	}
	_handleListDragStart(event) {
		this.setState({dragID:'option'+event.target.dataset.optionname});
		this.refs.listplaceholder.firstChild.innerHTML = event.target.firstChild.innerHTML;
	}
	_handleListMove(event) { this._handleElementMove(event, this.refs.listplaceholder); }
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
		let rect = event.target.getBoundingClientRect();
		this.setState({
			dragID:event.target.dataset.attributeid,
			thingsBeforeDragging: this.state.things,
			dragStartX: event.pageX - rect.left,
			dragStartY: event.pageY - rect.top
		});
		this.refs.cardplaceholder.innerHTML = event.target.innerHTML;
	}
	_handleCardMove(event) {
		let rotate = 'rotate(' + event.dx*3 + 'deg)';
		this._handleElementMove(event, this.refs.cardplaceholder, rotate);
	}
	_handleCardOverList(event) {
		let aO = Object.assign(this.state.attributesObject);
		aO[event.relatedTarget.dataset.attributeindex].value = event.target.dataset.option;
		if (event.target.dataset.swimlane) {
			aO[event.relatedTarget.dataset.swimlaneattributeindex].value = event.target.dataset.swimlane;
		}
		this.setState({attributesObject:aO});
	}
	_handleCardOverListHeader(event) {
		let dragged = event.relatedTarget;
		this._setThingPosition(dragged.dataset.thingid, 0);
	}
	_handleCardOverListFooter(event) {
		let dragged = event.relatedTarget;
		this._setThingPosition(dragged.dataset.thingid, this.state.things.length);
	}
	_handleCardDroppedOnList(event) {
		feathers_app.service('attributes')
			.patch(event.relatedTarget.dataset.attributeid, {value:event.target.dataset.option})
			.then(result => { console.log(result); })
			.catch(console.error);
		if (event.target.dataset.swimlane) {
			feathers_app.service('attributes')
				.patch(event.relatedTarget.dataset.swimlaneattributeid, {value:event.target.dataset.swimlane})
				.then(result => { console.log(result); })
				.catch(console.error);
		}
	}
	_handleCardOverCard(event) {
		let dragged = event.relatedTarget, dropzone = event.target;
		if (dragged.dataset.thingid == dropzone.dataset.thingid) return;
		this._setThingPosition(dragged.dataset.thingid, parseInt(dropzone.dataset.listposition) + 0.5);
	}
	_handleDragEnd(event) {
		this.setListPositions(this.props, this.state.things);
		this.refs.cardplaceholder.style.display = 'none';
		this.refs.listplaceholder.style.display = 'none';
		this.setState({
			dragging: null,
			dragID: null
		});
	}
}

module.exports = withRouter(CollectionBoard);
