import React from 'react';
import Modal from 'react-modal';
import { withRouter } from 'react-router';

import fieldTypes from './attributes/index.js';
import MessageBanner from './messagebanner.jsx';

class ConfigureThing extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			attributesObject: {},
			fields: []
		}
	}
	returnToCollection(event) {
		if (event) event.preventDefault();
		this.props.router.push('/workspace/' + this.props.params.workspace + '/collection/' + this.props.params.collection);
	}
	handleDeleteClick() {
		if (!confirm('Are you sure?')) return;
		feathers_app.service('things').remove(this.props.params.thing).catch(console.error);
		this.returnToCollection();
	}
	updateState(props) {
		this.setState({
			attributesObject: props.attributesObject,
			fields: props.fields
		})
	}
	componentDidMount() { this.updateState(this.props); }
	componentWillReceiveProps(nextProps) { this.updateState(nextProps); }
	render() {
		let that = this;
		return (
			<Modal isOpen={true} contentLabel="configurecollection">
				<div className="modalContent">
					<MessageBanner ref="messageBanner" />
					<button
						className="pure-button button-small"
						onClick={this.returnToCollection.bind(this)}>
						<i className="fa fa-close" />
					</button>
					<form className="pure-form pure-form-aligned" onSubmit={this.returnToCollection.bind(this)}>
						<fieldset>
							{this.props.fields.map(function(field) {
								let FieldComponent = fieldTypes[field.type].component,
									attribute = that.state.attributesObject[that.props.params.thing + field._id],
									value = (attribute)? attribute.value: null;
								return (
									<div key={field._id} className="pure-control-group">
										<label>{field.name}</label>
										<FieldComponent
											fieldType={field.type}
											attribute={attribute}
											value={value}
											options={field.options}
											onCreateOption={that.props.onCreateOption.bind(that, field._id)}
											onCommitChange={that.props.onCommitValueChange.bind(that, that.props.params.thing, field._id, attribute)} />
									</div>
								);
							})}
						</fieldset>
					</form>
					<button className="pure-button button-error"
						onClick={this.handleDeleteClick.bind(this)}>
						Delete Thing
					</button>
				</div>
			</Modal>
		);
	}
}

module.exports = withRouter(ConfigureThing);