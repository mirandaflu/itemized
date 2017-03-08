import React from 'react';
import Modal from 'react-modal';
import { Link, withRouter } from 'react-router';

class ConfigureCollection extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			collection: {}
		};
	}
	loadCollection() {
		feathers_app.service('collections').get(this.props.params.collection)
			.then(result => { this.setState({ collection: result }); })
			.catch(console.error);
	}
	handleNameChange(e) {
		let name = e.target.value;
		feathers_app.service('collections').patch(this.props.params.collection, {name:name}).catch(console.error);
	}
	handleDeleteClick() {
		if (!confirm('Are you sure?')) return;
		feathers_app.service('collections').remove(this.props.collection._id).then(result => {
			this.props.router.push('/workspace/'+this.props.params.workspace);
		});
	}
	handlePatchedCollection(collection) {
		if (collection._id == this.state.collection._id) {
			this.setState({ collection: collection });
		}
	}
	returnToCollection(event) {
		event.preventDefault();
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
									value={this.state.collection.name}
									onChange={this.handleNameChange.bind(this)} />
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