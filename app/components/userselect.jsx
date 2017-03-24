import React from 'react';
import Select from 'react-select';

export default class UserSelect extends React.Component {
	state = { value: this.props.value }
	loadUsers = (input, callback) => {
		if (!input) return Promise.resolve({ options: [] });
		const query = {username: {$regex: input, $options: 'i'}};
		return feathersApp.service('users').find({query: query}).then(result => {
			const options = result.data.map(user => {
				return { label: user.username, value: user._id };
			});
			return { options: options };
		}).catch(console.error);
	}
	handleChange = (value) => {
		this.setState({ value: value });
		this.props.onChange(value);
	}
	componentWillReceiveProps(nextProps) {
		this.setState({ value: nextProps.value });
	}
	render() {
		return (
			<Select.Async
				value={this.state.value}
				multi={this.props.multi}
				loadOptions={this.loadUsers}
				onChange={this.handleChange} />
		);
	}
}
