import React from 'react';
import Modal from 'react-modal';
import { Link, withRouter } from 'react-router';

import MessageBanner from './messagebanner.jsx';

class ConfigureCollection extends React.Component {
	state = {
		name: '',
		collection: {},
		views: []
	}
	loadCollection = () => {
		feathers_app.service('collections').get(this.props.params.collection)
			.then(result => { this.setState({ collection: result, name: result.name }); })
			.catch(this.showMessage.bind(this));
	}
	getViews = (props) => {
		feathers_app.service('views').find({query:{ coll: this.props.params.collection }}).then(views => {
			this.setState({ views: views });
		}).catch(console.error);
	}
	deleteView = (view) => {
		feathers_app.service('views').remove(view).catch(console.error);
	}
	handleCreatedView = (view) => {
		if (view.coll != this.props.params.collection) return;
		this.setState({ views: this.state.views.concat(view) });
	}
	handlePatchedView = (view) => {
		for (let i in this.state.views) {
			if (this.state.views[i]._id == view._id) {
				let newViews = this.state.views;
				newViews[i] = Object.assign({}, view);
				this.setState({ views: newViews });
				break;
			}
		}
	}
	handleRemovedView = (view) => {
		for (let i in this.state.views) {
			if (this.state.views[i]._id == view._id) {
				let newViews = this.state.views;
				newViews.splice(i, 1);
				this.setState({ views: newViews });
				break;
			}
		}
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
		this.getViews(this.props);
		feathers_app.service('collections').on('patched', this.handlePatchedCollection);
		feathers_app.service('views').on('created', this.handleCreatedView);
		feathers_app.service('views').on('patched', this.handlePatchedView);
		feathers_app.service('views').on('removed', this.handleRemovedView);
	}
	componentWillUnmount() {
		feathers_app.service('collections').removeListener('patched', this.handlePatchedCollection);
		feathers_app.service('views').removeListener('created', this.handleCreatedView);
		feathers_app.service('views').removeListener('patched', this.handlePatchedView);
		feathers_app.service('views').removeListener('removed', this.handleRemovedView);
	}
	render() {
		let that = this;
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

					<h3>Views</h3>
					{this.state.views.map(view => {
						return (
							<div key={view._id} className="pure-g" style={{width:'50%'}}>
								<div className="pure-u-1-2" style={{padding:'4pt'}}>
									{view.name}
								</div>
								{!view.default && 
									<div className="pure-u-1-2">
										<button className="pure-button button-small button-error"
											onClick={that.deleteView.bind(that,view._id)}>
											Delete View
										</button>
									</div>
								}
							</div>
						);
					})}

					<hr />
					<h3>Template</h3>
					<Link className="pure-button" to={'/workspace/' + this.props.params.workspace + '/collection/' + this.props.params.collection}>Empty Collection</Link>
				</div>
			</Modal>
		);
	}
}

module.exports = withRouter(ConfigureCollection);