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
		if (props.value == null || props.value == '') {
			this.setState({ value: null });
		}
		else if (this.props.fieldType == 'Attribute Reference') {
			feathers_app.service('attributes').find({query:{
				coll: this.props.collection,
				_id: props.value
			}}).then(attributes => {
				if (attributes.length == 0) this.setState({ value: null });
				else this.setState({ value: attributes[0].value });
			}).catch();
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
		if (this.props.fieldType == 'Attribute Reference') {
			this.attributePatchedListener = this.handlePatchedAttribute.bind(this);
			feathers_app.service('attributes').on('patched', this.attributePatchedListener);
		}
	}
	componentWillUnmount() {
		if (this.props.fieldType == 'Attribute Reference') {
			feathers_app.service('attributes').removeListener('patched', this.attributePatchedListener);
		}
	}
	render() {
		return (
			<span>
				{this.props.fieldType == 'Attribute Reference' &&
					<Link style={{float:'right'}} to={'/workspace/'+this.props.workspace+'/collection/'+this.props.collection+'/reference/'+this.props.thing+'/'+this.props.field}>
						<i className="fa fa-edit" />
					</Link>
				}
				{this.props.value && this.state.value}
			</span>
		);
	}
}
