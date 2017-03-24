import React from 'react';
import moment from 'moment';
import interact from 'interact.js';
import { Link } from 'react-router';

export default class CollectionCalendar extends React.Component {
	state = {
		things: this.props.things,
		month: moment().startOf('month').format(),
		attributesObject: this.props.attributesObject,
		dragging: null,
		dragID: null,
		dragStartX: 0,
		dragStartY: 0,
		dropAttribute: null
	}
	setUpDragDrop = () => {
		interact('.calendar .card').draggable({
			autoScroll: true,
			onstart: this._handleDragStart.bind(this),
			onmove: this._handleDragMove.bind(this),
			onend: this._handleDragEnd.bind(this)
		});
		interact('.calendar .day').dropzone({
			accept: '.card',
			ondragenter: this._handleCardOverDay.bind(this)
		});
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
		this.setState({
			things: nextProps.things,
			attributesObject: nextProps.attributesObject,
			dateField: this.getField(nextProps, nextProps.view.dateField),
			swimLane: this.getField(nextProps, nextProps.view.swimLane)
		});
	}
	componentDidMount() {
		this.setUpDragDrop();
	}
	render() {
		const days = [];
		const d = moment(this.state.month).startOf('month').startOf('week');
		while (d < moment(this.state.month).endOf('month').endOf('week')) {
			days.push({
				key: d.format(),
				date: d.format('D'),
				weekday: d.format('ddd'),
				start: d.format(),
				end: d.add(1, 'days').format(),
			});
		}
		const that = this;
		return (
			<div>
				<div className="pure-g" style={{marginTop: '8pt'}}>
					<div className="pure-u-1">
						<button className="pure-button" style={{float: 'left'}} onClick={() => {
							this.setState({month: moment(this.state.month).subtract(1, 'months')});
						}}>
							<i className="fa fa-arrow-left" />
						</button>
						<button className="pure-button" style={{float: 'right'}} onClick={() => {
							this.setState({month: moment(this.state.month).add(1, 'months')});
						}}>
							<i className="fa fa-arrow-right" />
						</button>
						<h2 style={{textAlign: 'center'}}>
							{moment(this.state.month).format('MMMM')}
						</h2>

					</div>
				</div>
				<div className="pure-g calendar">
					<div ref="cardplaceholder"
						style={{display: 'none', fontFamily: "'Open Sans', sans-serif"}}
						className="card withshadow hovershadow pure-u-1-7" />
					{['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(weekday => {
						return (
							<div key={weekday} className="pure-u-1-7 dark weekday">
								{weekday}
							</div>
						);
					})}
					{days.map(day => {
						return (
							<div key={day.key} className="pure-g pure-u-1-7">

								<div data-date={day.key} className="medium-dark day pure-u-1">

									<div className="date">{day.date}</div>

									{that.state.things.filter(thing => {
										const i = thing._id + that.props.view.dateField;
										const t = that.props.attributesObject[i] ?
												that.props.attributesObject[i].value : null;
										return t && moment(t).isSameOrAfter(day.start) &&
											moment(t).isBefore(day.end);
									}).map(thing => {
										const index = thing._id + that.props.view.dateField;
										const id = that.props.attributesObject[index]._id;
										const i = thing._id + that.props.view.cardField;
										const name = that.props.attributesObject[i].value;

										return (
											<div key={i}
												data-dateattributeindex={index}
												data-dateattributeid={id}
												className={'card withshadow hovershadow'
													+ ((id === that.state.dragID) ? ' dragging' : '')}>

												<Link style={{float: 'right'}}
													to={'/workspace/' + that.props.collection.workspace + '/collection/' + that.props.collection._id + '/thing/' + thing._id}>
													<i className="fa fa-expand" />
												</Link>

												{name}

											</div>
										);
									})}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		);
	}
	_handleDragStart(event) {
		const rect = event.target.getBoundingClientRect();
		this.setState({
			dragID: event.target.dataset.dateattributeid,
			thingsBeforeDragging: this.state.things,
			dragStartX: event.pageX - rect.left,
			dragStartY: event.pageY - rect.top
		});
		this.refs.cardplaceholder.innerHTML = event.target.innerHTML;
	}
	_handleDragMove(event) {
		const x = event.clientX - this.state.dragStartX;
		const y = event.clientY - this.state.dragStartY;
		const draggedEl = this.refs.cardplaceholder;
		draggedEl.style.display = 'block';
		draggedEl.style.position = 'absolute';
		draggedEl.style.top = '0px';
		draggedEl.style.left = '0px';
		draggedEl.style.WebkitTransition = draggedEl.style.transition = 'transform 0.1s';
		const transform = 'translate(' + x + 'px, ' + y + 'px) rotate(' + (event.dx * 3) + 'deg)';
		draggedEl.style.webkitTransform = draggedEl.style.transform =
			draggedEl.style.msTransform = transform;
	}
	_handleCardOverDay(event) {
		const aO = Object.assign(this.state.attributesObject);
		const s = {};
		const currentdate = this.state.attributesObject[event.relatedTarget.dataset.dateattributeindex].value;
		let newdate = event.target.dataset.date;
		const time = moment(currentdate).diff(moment(currentdate).startOf('day'));
		if (time !== 0) {
			newdate = moment(newdate).add(time, 'ms').format();
		}
		aO[event.relatedTarget.dataset.dateattributeindex].value = newdate;
		s.dropAttribute = { id: event.relatedTarget.dataset.dateattributeid, value: newdate };
		s.attributesObject = aO;
		this.setState(s);
	}
	_handleDragEnd() {
		feathersApp.service('attributes')
			.patch(this.state.dropAttribute.id, {value: this.state.dropAttribute.value})
			.catch(console.error);
		this.refs.cardplaceholder.style.display = 'none';
		this.setState({
			dragging: null,
			dragID: null
		});
	}
}
