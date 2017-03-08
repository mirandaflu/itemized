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
	loadCollection() {
		feathers_app.service('collections').get(this.props.params.collection)
			.then(result => { this.setState({ collection: result, name: result.name }); })
			.catch(console.error);
	}
	handleNameChange(event) {
		this.setState({ name: event.target.value });
	}
	commitNameChange() {
		if (this.state.name == '') this.refs.messageBanner.showMessage('Name cannot be blank');
		else feathers_app.service('collections').patch(this.props.params.collection, {name:this.state.name}).catch(console.error);
	}
	handleDeleteClick() {
		if (!confirm('Are you sure?')) return;
		feathers_app.service('collections').remove(this.props.collection._id).then(result => {
			this.props.router.push('/workspace/'+this.props.params.workspace);
		});
	}
	handlePatchedCollection(collection) {
		if (collection._id == this.state.collection._id) {
			this.setState({ collection: collection, name: collection.name });
		}
	}
	returnToCollection(event) {
		event.preventDefault();
		this.commitNameChange();
		this.props.router.push('/workspace/' + this.props.params.workspace + '/collection/' + this.props.params.collection);
	}
	componentDidMount() {
		this.loadCollection();
		this.collectionPatchedListener = this.handlePatchedCollection.bind(this);
		feathers_app.service('collections').on('patched', this.collectionPatchedListener);
	}
	componentWillUnmount() {
		feathers_app.service('collections').removeListener('patched', this.collectionPatchedListener);
	}
	render() {
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
							<div className="pure-control-group">
								<label htmlFor="name">Collection Name</label>
								<input id="name" type="text"
									ref="nameInput"
									value={this.state.name}
									onChange={this.handleNameChange.bind(this)}
									onBlur={this.commitNameChange.bind(this)} />
							</div>
						</fieldset>
					</form>
					<button className="pure-button button-error"
						onClick={this.handleDeleteClick.bind(this)}>
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