import React from 'react';
import { Link } from 'react-router';

export default class StaticInput extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			value: this.props.value
		};
	}
	setValue(props) {
		if (this.props.fieldType == 'Reference' && props.value) {
			feathers_app.service('attributes').get(props.value)
				.then(attribute => { this.setState({ value: attribute.value }); })
				.catch(console.error);
		}
		else {
			this.setState({ value: props.value });
		}
	}
	componentWillReceiveProps(nextProps) { this.setValue(nextProps); }
	componentDidMount() { this.setValue(this.props); }
	render() {
		return (
			<span>
				{this.props.fieldType == 'Reference' &&
					<Link style={{float:'right'}} to={'/workspace/'+this.props.workspace+'/collection/'+this.props.collection+'/reference/'+this.props.thing+'/'+this.props.field}>
						<i className="fa fa-edit" />
					</Link>
				}
				{this.state.value}
			</span>
		);
	}
}
