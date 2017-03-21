import React from 'react';
import Modal from 'react-modal';
import { Link, withRouter } from 'react-router';

import MessageBanner from './messagebanner.jsx';

class ConfigureCollection extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			name: null,
			collection: {}
		};
	}
	loadCollection = () => {
		feathers_app.service('collections').get(this.props.params.collection)
			.then(result => { this.setState({ collection: result, name: result.name }); })
			.catch(this.showMessage.bind(this));
	}
	handleNameChange = (event) => this.setState({ name: event.target.value });
	commitNameChange = () => {
		if (this.state.name == '') this.refs.messageBanner.showMessage('Name cannot be blank');
		else {
			feathers_app.service('collections')
				.patch(this.props.params.collection, {name:this.state.name})
				.catch(this.showMessage.bind(this));
		}
	}
	handleDeleteClick = () => {
		if (!confirm('Are you sure?')) return;
		feathers_app.service('collections').remove(this.props.params.collection).then(result => {
			this.props.router.push('/workspace/'+this.props.params.workspace);
		});
	}
	handlePatchedCollection = (collection) => {
		if (collection._id == this.state.collection._id) {
			this.setState({ collection: collection, name: collection.name });
		}
	}
	returnToCollection = (event) => {
		event.preventDefault();
		this.commitNameChange();
		this.props.router.push('/workspace/' + this.props.params.workspace + '/collection/' + this.props.params.collection);
	}
	showMessage = (error) => {
		if (this.refs.messageBanner) this.refs.messageBanner.showMessage(error.message);
	}
	componentDidMount() {
		this.loadCollection();
		feathers_app.service('collections').on('patched', this.handlePatchedCollection);
	}
	componentWillUnmount() {
		feathers_app.service('collections').removeListener('patched', this.handlePatchedCollection);
	}
	render() {
		return (
			<Modal isOpen={true} contentLabel="configurecollection">
				<div className="modalContent">
					<MessageBanner ref="messageBanner" />
					<button
						className="pure-button button-small"
						onClick={this.returnToCollection}>
						<i className="fa fa-close" />
					</button>
					<form className="pure-form pure-form-aligned" onSubmit={this.returnToCollection}>
						<fieldset>
							<div className="pure-control-group">
								<label htmlFor="name">Collection Name</label>
								<input id="name" type="text"
									ref="nameInput"
									value={this.state.name}
									onChange={this.handleNameChange}
									onBlur={this.commitNameChange} />
							</div>
						</fieldset>
					</form>
					<button className="pure-button button-error"
						onClick={this.handleDeleteClick}>
						Delete Collection
					</button>

					Choose Template:
					<br /><br />
					<Link className="pure-button" to={'/workspace/' + this.props.params.workspace + '/collection/' + this.props.params.collection}>Empty Collection</Link>
				</div>
			</Modal>
		);
	}
}

module.exports = withRouter(ConfigureCollection);