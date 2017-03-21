import React from 'react';
import Datetime from 'react-datetime';
import moment from 'moment';

export default class DateInput extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			value: (this.props.value && this.props.value != '')? moment(this.props.value): null,
			tempValue: null
		};
	}
	setTemp = () =>	this.setState({ tempValue: this.state.value });
	handleChange = (value) => {
		if (value._isAMomentObject) {
			this.setState({ value: value });
			value = new Date(value._d);
			this.props.onCommitChange({ target: {value: value} });
		}
	}
	clearIfNotValid = (value) => {
		if (!value._isAMomentObject) {
			if (value == '') {
				this.setState({ value: null });
				this.props.onCommitChange({target: {value: null} });
			}
			else {
				this.setState({ value: this.state.tempValue });
				this.props.onCommitChange({target: {value: new Date(this.state.tempValue)} });
			}
		}
	}
	componentWillReceiveProps(nextProps) {
		this.setState({
			value: (nextProps.value && nextProps.value != '')? moment(nextProps.value): null
		});
	}
	render() {
		return (
			<Datetime
				value={this.state.value}
				dateFormat={(this.props.fieldType.indexOf('Date') != -1)? 'YYYY-MM-DD': false}
				timeFormat={(this.props.fieldType.indexOf('Time') != -1)? 'hh:mm:ss a': false}
				onFocus={this.setTemp}
				onBlur={this.clearIfNotValid}
				onChange={this.handleChange} />
		);
	}
}