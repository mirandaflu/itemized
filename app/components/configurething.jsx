import React from 'react';
import Modal from 'react-modal';
import { withRouter } from 'react-router';

import fieldTypes from 'components/attributes/';
import MessageBanner from 'components/messagebanner';

class ConfigureThing extends React.Component {
	state = {
		attributesObject: {},
		fields: []
	}
	returnToCollection = (event) => {
		if (event) event.preventDefault();
		this.props.router.push('/workspace/' + this.props.params.workspace + '/collection/' + this.props.params.collection);
	}
	handleDeleteClick = () => {
		if (!confirm('Are you sure?')) return;
		feathersApp.service('things').remove(this.props.params.thing).catch(console.error);
		this.returnToCollection();
	}
	updateState = (props) => {
		this.setState({
			attributesObject: props.attributesObject,
			fields: props.fields
		});
	}
	componentDidMount() { this.updateState(this.props); }
	componentWillReceiveProps(nextProps) { this.updateState(nextProps); }
	render() {
		const that = this;
		return (
			<Modal isOpen contentLabel="configurecollection">
				<div className="modalContent">
					<MessageBanner ref="messageBanner" />
					<button
						className="pure-button button-small"
						onClick={this.returnToCollection}>
						<i className="fa fa-close" />
					</button>
					<form className="pure-form pure-form-aligned" onSubmit={this.returnToCollection}>
						<fieldset>
							{this.props.fields.map(field => {
								const FieldComponent = fieldTypes[field.type].component;
								const attribute = that.state.attributesObject[that.props.params.thing + field._id];
								const value = (attribute) ? attribute.value : null;
								return (
									<div key={field._id} className="pure-control-group" style={{maxWidth: '380px'}}>
										<label>{field.name}</label>
										<FieldComponent
											clearable
											fieldType={field.type}
											workspace={that.props.params.workspace}
											collection={that.props.params.collection}
											thing={that.props.params.thing}
											field={field._id}
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
