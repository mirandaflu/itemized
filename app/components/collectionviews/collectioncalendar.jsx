import React from 'react';
import moment from 'moment';

export default class CollectionCalendar extends React.Component {
	render() {
		let days = [];
		let day = moment().startOf('month').startOf('week');
		while (day < moment().endOf('month').endOf('week')) {
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
				<h2 style={{textAlign:'center'}}>{moment().format('MMMM')}</h2>
				<div className="pure-g">
					{days.map(function(day) {
						return(
							<div key={day.key} className={(day.weekday == 'Sun')?
								'pure-u-1 pure-u-sm-1-4 pure-g':'pure-u-1 pure-u-sm-1-8 pure-g'}>
								
								{day.weekday == 'Sun' && <div className="pure-u-1 pure-u-sm-1-2" />}

								<div className={(day.weekday == 'Sun')?
									'pure-u-1 pure-u-sm-1-2 dark': 'pure-u-1 dark'}
									style={{minHeight:'150px'}}>

									{day.weekday + ' ' + day.date}

									{that.props.things.filter(function(thing) {
										let i = thing._id+that.props.collection.dateField,
											t = that.props.attributesObject[i]?
												that.props.attributesObject[i].value: null;
										return t && moment(t).isSameOrAfter(day.start) &&
											moment(t).isSameOrBefore(day.end);
									}).map(function(thing) {
										let i = thing._id+that.props.collection.cardField,
											name = that.props.attributesObject[i].value;
										return (<div key={i} className="card">{name}</div>);
									})}
								</div>

							</div>
						);
					})}
				</div>
			</div>
		);
	}
}