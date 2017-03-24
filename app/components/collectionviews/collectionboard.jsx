import React from 'react';
import { Link, withRouter } from 'react-router';
import interact from 'interact.js';

class CollectionBoard extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			things: this.props.things,
			attributesObject: this.props.attributesObject,
			boardField: this.getField(this.props, this.props.view.boardField),
			swimLane: this.getField(this.props, this.props.view.swimLane),
			dragging: null,
			dragID: null,
			dragStartX: 0,
			dragStartY: 0,
			dropAttribute: null,
			dropSwimlaneAttribute: null
		};
	}
	addList = () => {
		if (!this.state.boardField._id) return alert('Please select a field to list things by before trying to create a list.');
		const name = prompt('Name?');
		if (!name) return null;
		return feathersApp.service('fields')
			.patch(this.state.boardField._id, {options: this.state.boardField.options.concat(name)})
			.catch(console.error);
	}
	setUpDragDrop = () => {
		interact('#board .list').draggable({
			autoScroll: true,
			onstart: this._handleListDragStart.bind(this),
			onmove: this._handleListMove.bind(this),
			onend: this._handleListDragEnd.bind(this)
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
			onend: this._handleCardDragEnd.bind(this)
		});
		interact('#board .carddropzone').dropzone({
			accept: '.card',
			ondragenter: this._handleCardOverList.bind(this)
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
	setListPositions = (props, thingsParam) => {
		const things = Object.assign({}, thingsParam);
		const boardField = this.getField(props, props.view.boardField);
		const attributesObject = props.attributesObject;
		const listMapping = {};
		if (boardField) {
			boardField.options.map(option => {
				let i = 1;
				things.map(thing => {
					if (!attributesObject[thing._id + boardField._id]) return;
					if (attributesObject[thing._id + boardField._id].value === option) {
						const nameIndex = thing._id + props.view.cardField;
						const cardName = (attributesObject[nameIndex]) ?
								attributesObject[nameIndex].value :
								null;
						if (!cardName) return;
						const attributeIndex = thing._id + boardField._id;
						const attributeID = attributesObject[attributeIndex]._id;
						listMapping[thing._id] = i;
						i += 1;
					}
				});
			});
			for (const id in listMapping) {
				feathersApp.service('things').patch(id, {listPosition: listMapping[id]})
					.catch(console.error);
			}
		}
	}
	addThing = (event) => {
		let cardFieldName = '';
		const fields = this.props.fields;
		for (const i in fields) {
			if (fields[i]._id === this.props.view.cardField) {
				cardFieldName = fields[i].name;
			}
		}
		const s = prompt(cardFieldName + '?');
		if (!s) return;

		const listvalue = event.target.dataset.listvalue;
		const swimLane = event.target.dataset.swimlane;
		const thing = {
			coll: this.props.collection._id,
			listPosition: this.props.things.length
		};
		feathersApp.service('things').create(thing).then(newThing => {
			const attr1 = {
				coll: this.props.collection._id,
				thing: newThing._id,
				field: this.props.view.cardField,
				value: s
			};
			const attr2 = {
				coll: this.props.collection._id,
				thing: newThing._id,
				field: this.props.view.boardField,
				value: listvalue
			};
			feathersApp.service('attributes').create(attr1).catch(console.error);
			feathersApp.service('attributes').create(attr2).catch(console.error);
			if (this.props.view.swimLane) {
				const attr3 = {
					coll: this.props.collection._id,
					thing: newThing._id,
					field: this.props.view.swimLane,
					value: swimLane
				};
				feathersApp.service('attributes').create(attr3).catch(console.error);
			}
		}).catch(console.error);
	}
	getField = (props, id) => {
		let field = null;
		for (const i in props.fields) {
			if (props.fields[i]._id === id) {
				field = props.fields[i];
				break;
			}
		}
		return field;
	}
	componentWillReceiveProps(nextProps) {
		const things = nextProps.things;
		things.sort((a, b) => { return a.listPosition - b.listPosition; });
		this.setState({
			attributesObject: nextProps.attributesObject,
			boardField: this.getField(nextProps, nextProps.view.boardField),
			things: things,
			swimLane: this.getField(nextProps, nextProps.view.swimLane)
		});
	}
	componentDidMount() {
		this.setUpDragDrop();
	}
	render() {
		const that = this;
		const boardField = this.state.boardField;
		const attributesObject = this.state.attributesObject;
		const things = this.state.things;
		const swimLane = this.state.swimLane;

		const renderBoardNodes = (options = {}) => {
			return (option, index) => {
				let i = -1;
				return (
					<div key={option + options.swimLaneOption}
						data-optionname={option}
						data-optionindex={index}
						className={'list listdropzone medium-dark pure-u-1 pure-u-sm-1-4 pure-u-md-1-5 pure-u-lg-1-6'
							+ (('option' + option === that.state.dragID) ? ' dragging' : '')}>

						<h4 className="listheader">{option}</h4>
						<div data-option={option} data-swimlane={options.swimLaneOption} className="carddropzone">
							{things.map(thing => {
								if (!attributesObject[thing._id + boardField._id]) return null;
								if (attributesObject[thing._id + boardField._id].value === option &&
								(!options.swimLane || attributesObject[thing._id + options.swimLane._id].value === options.swimLaneOption)) {
									const nameIndex = thing._id + that.props.view.cardField;
									const cardName = (attributesObject[nameIndex]) ?
											attributesObject[nameIndex].value :
											null;
									if (!cardName) return null;

									const attributeIndex = thing._id + boardField._id;
									const attributeID = attributesObject[attributeIndex]._id;

									const SLattributeIndex = (!options.swimLane) ? null : thing._id + options.swimLane._id;
									const SLattributeID = (!options.swimLane) ? null : (attributesObject[SLattributeIndex]) ?
										attributesObject[SLattributeIndex]._id : null;

									i += 1;
									return (
										<div
											className={'card withshadow hovershadow'
												+ ((attributeID === that.state.dragID) ? ' dragging' : '')}
											data-attributeindex={attributeIndex}
											data-attributeid={attributeID}
											data-swimlaneattributeindex={SLattributeIndex}
											data-swimlaneattributeid={SLattributeID}
											data-thingid={thing._id}
											data-thingposition={i}
											data-listposition={thing.listPosition}
											key={thing._id + that.props.view.cardField}>

											<Link style={{float: 'right'}}
												to={'/workspace/' + that.props.collection.workspace + '/collection/' + that.props.collection._id + '/thing/' + thing._id}>
												<i className="fa fa-expand" />
											</Link>

											{cardName}

										</div>
									);
								}
								return null;
							})}
							<div style={{padding: '2px 4px'}}>
								<button className="pure-button button-small button-secondary"
									data-listvalue={option}
									data-swimlane={options.swimLaneOption}
									style={{width: '100%'}}
									onClick={that.addThing}>
									<i className="fa fa-plus" />
								</button>
							</div>
						</div>
						<div className="listfooter" style={{width: '100%', height: '24px'}} />
					</div>
				);
			};
		};

		return (
			<div id="board" ref="board">
				<div ref="cardplaceholder"
					style={{display: 'none', fontFamily: "'Open Sans', sans-serif"}}
					className="card withshadow hovershadow pure-u-1 pure-u-sm-1-4 pure-u-md-1-5 pure-u-lg-1-6" />
				<div ref="listplaceholder"
					style={{display: 'none'}}
					className="list medium-dark pure-u-1 pure-u-sm-1-4 pure-u-md-1-5 pure-u-lg-1-6">
					<h4 />
				</div>
				{swimLane && swimLane.options.map(option => {
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
					<button className="pure-button button-secondary" onClick={this.addList}>
						<i className="fa fa-plus" /> Add List
					</button>
				</div>
			</div>
		);
	}
	_setThingPosition(thing, position) {
		const things = Object.assign(this.state.thingsBeforeDragging);
		for (const i in things) {
			if (things[i]._id === thing) {
				things[i].listPosition = position;
			}
		}
		things.sort((a, b) => { return a.listPosition - b.listPosition; });
		this.setState({things: things});
	}
	_handleElementMove(event, placeholder, extraTransform) {
		const x = event.clientX - this.state.dragStartX;
		const y = event.clientY - this.state.dragStartY;
		const draggedEl = placeholder;
		draggedEl.style.display = 'block';
		draggedEl.style.position = 'absolute';
		draggedEl.style.top = '0px';
		draggedEl.style.left = '0px';
		draggedEl.style.WebkitTransition = draggedEl.style.transition = 'transform 0.1s';
		let transform = 'translate(' + x + 'px, ' + y + 'px) ';
		if (extraTransform) transform += ' ' + extraTransform;
		draggedEl.style.webkitTransform = draggedEl.style.transform =
			draggedEl.style.msTransform = transform;
	}
	_handleListDragStart(event) {
		this.setState({dragID: 'option' + event.target.dataset.optionname});
		this.refs.listplaceholder.firstChild.innerHTML = event.target.firstChild.innerHTML;
	}
	_handleListMove(event) { this._handleElementMove(event, this.refs.listplaceholder); }
	_handleListOverList(event) {
		const bF = Object.assign(this.state.boardField);
		const opt = bF.options.splice(parseInt(event.target.dataset.optionindex, 10), 1);
		bF.options.splice(event.relatedTarget.dataset.optionindex, 0, opt[0]);
		this.setState({boardField: bF});
	}
	_handleListDroppedOnList() {
		feathersApp.service('fields')
			.patch(this.state.boardField._id, {options: this.state.boardField.options})
			.catch(console.error);
	}
	_handleListDragEnd() {
		this._handleDragEnd();
	}
	_handleCardDragStart(event) {
		const rect = event.target.getBoundingClientRect();
		this.setState({
			dragID: event.target.dataset.attributeid,
			thingsBeforeDragging: this.state.things,
			dragStartX: event.pageX - rect.left,
			dragStartY: event.pageY - rect.top
		});
		this.refs.cardplaceholder.innerHTML = event.target.innerHTML;
	}
	_handleCardMove(event) {
		const rotate = 'rotate(' + (event.dx * 3) + 'deg)';
		this._handleElementMove(event, this.refs.cardplaceholder, rotate);
	}
	_handleCardOverList(event) {
		const aO = Object.assign(this.state.attributesObject);
		const s = {};
		aO[event.relatedTarget.dataset.attributeindex].value = event.target.dataset.option;
		s.dropAttribute = { id: event.relatedTarget.dataset.attributeid, value: event.target.dataset.option };
		if (event.target.dataset.swimlane) {
			aO[event.relatedTarget.dataset.swimlaneattributeindex].value = event.target.dataset.swimlane;
			s.dropSwimlaneAttribute = { id: event.relatedTarget.dataset.swimlaneattributeid, value: event.target.dataset.swimlane };
		} else {
			s.dropSwimlaneAttribute = null;
		}
		s.attributesObject = aO;
		this.setState(s);
	}
	_handleCardOverListHeader(event) {
		const dragged = event.relatedTarget;
		this._setThingPosition(dragged.dataset.thingid, 0);
	}
	_handleCardOverListFooter(event) {
		const dragged = event.relatedTarget;
		this._setThingPosition(dragged.dataset.thingid, this.state.things.length);
	}
	_handleCardOverCard(event) {
		const dragged = event.relatedTarget;
		const dropzone = event.target;
		if (dragged.dataset.thingid === dropzone.dataset.thingid) return;
		this._setThingPosition(dragged.dataset.thingid, parseInt(dropzone.dataset.listposition, 10) + 0.5);
	}
	_handleCardDragEnd() {
		feathersApp.service('attributes')
			.patch(this.state.dropAttribute.id, {value: this.state.dropAttribute.value})
			.catch(console.error);
		if (this.state.dropSwimlaneAttribute) {
			feathersApp.service('attributes')
				.patch(this.state.dropSwimlaneAttribute.id, {value: this.state.dropSwimlaneAttribute.value})
				.catch(console.error);
		}
		this._handleDragEnd();
	}
	_handleDragEnd() {
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
