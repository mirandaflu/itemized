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
	handlePatchedAttribute(attribute) {
		if (this.props.value == attribute._id) {
			this.setValue(this.props);
		}
	}
	componentWillReceiveProps(nextProps) {
		this.setValue(nextProps);
	}
	componentDidMount() {
		this.setValue(this.props);
		if (this.props.fieldType == 'Reference') {
			this.attributePatchedListener = this.handlePatchedAttribute.bind(this);
			feathers_app.service('attributes').on('patched', this.attributePatchedListener);
		}
	}
	componentWillUnmount() {
		if (this.props.fieldType == 'Reference') {
			feathers_app.service('attributes').removeListener('patched', this.attributePatchedListener);
		}
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
