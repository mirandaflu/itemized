import React from 'react';
import { Link } from 'react-router';

export default class StaticInput extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			value: this.props.value
		};
	}
	componentWillReceiveProps(nextProps) {
		this.setState({ value: nextProps.value });
	}
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
