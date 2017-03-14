import React from 'react';
import Modal from 'react-modal';
import Select from 'react-select';
import { withRouter } from 'react-router';

import MessageBanner from './messagebanner.jsx';

class ConfigureReference extends React.Component {
	returnToCollection(event) {
		if (event) event.preventDefault();
		this.props.router.push('/workspace/'+this.props.params.workspace+'/collection/'+this.props.params.collection);
	}
	render() {
		return (
			<Modal isOpen={true} contentLabel="configurereference">
				<div className="modalContent">
					<MessageBanner ref="messageBanner" />
					<button
						className="pure-button button-small"
						onClick={this.returnToCollection.bind(this)}>
						<i className="fa fa-close" />
					</button>
					<form className="pure-form pure-form-aligned" onSubmit={this.returnToCollection.bind(this)}>
						<fieldset>
							<div className="pure-control-group">
								<label htmlFor="type">Collection</label>
								<Select />
							</div>
							<div className="pure-control-group">
								<label htmlFor="type">Thing</label>
								<Select />
							</div>
							<div className="pure-control-group">
								<label htmlFor="type">Field</label>
								<Select />
							</div>
						</fieldset>
					</form>
				</div>
			</Modal>
		);
	}
}

module.exports = withRouter(ConfigureReference);