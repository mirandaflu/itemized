import React from 'react';
import moment from 'moment';

export default class CollectionCalendar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			month: moment().startOf('month').format()
		};
	}
	render() {
		let days = [];
		let day = moment(this.state.month).startOf('month').startOf('week');
		while (day < moment(this.state.month).endOf('month').endOf('week')) {
			days.push({
				key: day.format(),
				date: day.format('D'),
				weekday: day.format('ddd'),
				start: day.format(),
				end: day.add(1, 'days').format(),
			});
		}
		let that = this;
		return (
			<div>
				<div className="pure-g">
					<div className="pure-u-1 pure-u-sm-7-8">
						<button className="pure-button" style={{float:'left'}} onClick={e => {
							this.setState({month:moment(this.state.month).subtract(1, 'months')}); }}>
							<i className="fa fa-arrow-left" />
						</button>
						<button className="pure-button" style={{float:'right'}} onClick={e => {
							this.setState({month:moment(this.state.month).add(1, 'months')}); }}>
							<i className="fa fa-arrow-right" />
						</button>
						<h2 style={{textAlign:'center'}}>
							{moment(this.state.month).format('MMMM')}
						</h2>
					</div>
				</div>
				<div className="pure-g calendar">
					{['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(weekday => {
						return (
							<div key={weekday} className="pure-u-1 pure-u-sm-1-8 dark weekday">
								{weekday}
							</div>
						);
					})}
					<div className="pure-u-1 pure-u-sm-1-8" />
					{days.map(day => {
						return(
							<div key={day.key} className={(day.weekday == 'Sat')?
								'pure-u-1 pure-u-sm-1-4 pure-g':'pure-u-1 pure-u-sm-1-8 pure-g'}>
								
								<div className={(day.weekday == 'Sat')?
									'pure-u-1 pure-u-sm-1-2 medium-dark day': 'pure-u-1 medium-dark day'}>

									<div className="date">{day.date}</div>

									{that.props.things.filter(function(thing) {
										let i = thing._id+that.props.collection.dateField,
											t = that.props.attributesObject[i]?
												that.props.attributesObject[i].value: null;
										return t && moment(t).isSameOrAfter(day.start) &&
											moment(t).isSameOrBefore(day.end);
									}).map(function(thing) {
										let i = thing._id+that.props.collection.cardField,
											name = that.props.attributesObject[i].value;
										return (<div key={i} className="card withshadow">{name}</div>);
									})}
								</div>

								{day.weekday == 'Sat' && <div className="pure-u-1 pure-u-sm-1-2" />}

							</div>
						);
					})}
				</div>
			</div>
		);
	}
}