import React from 'react';
import Datetime from 'react-datetime';
import moment from 'moment';

export default class DateInput extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			value: moment(this.props.value),
			tempValue: null
		};
	}
	setTemp() {
		this.setState({ tempValue: this.state.value });
	}
	handleChange(v) {
		if (v._isAMomentObject) {
			this.setState({ value: v });
			v = new Date(v._d);
			this.props.onCommitChange({ target: {value: v} });
		}
	}
	clearIfNotValid(v) {
		if (!v._isAMomentObject) {
			if (v == '') {
				this.setState({ value: null });
				this.props.onCommitChange({target: {value: null} });
			}
			else {
				this.setState({ value: this.state.tempValue });
				this.props.onCommitChange({target:
					{value: new Date(this.state.tempValue)}
				});
			}
		}
	}
	componentWillReceiveProps(nextProps) {
		this.setState({ value: moment(nextProps.value) });
	}
	render() {
		return (
			<Datetime
				value={this.state.value}
				dateFormat={(this.props.fieldType.indexOf('Date') != -1)?
					'YYYY-MM-DD': false}
				timeFormat={(this.props.fieldType.indexOf('Time') != -1)?
					'hh:mm:ss a': false}
				onFocus={this.setTemp.bind(this)}
				onBlur={this.clearIfNotValid.bind(this)}
				onChange={this.handleChange.bind(this)} />
		);
	}
}