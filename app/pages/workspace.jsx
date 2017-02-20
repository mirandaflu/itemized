import React from 'react';
import { Link, withRouter } from 'react-router';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

import collectionViews from '../components/collectionviews/index.js';
import StatusText from '../components/statustext.jsx';

class Workspace extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			itemHeight: '35px',
			id: this.props.routeParams.workspace,
			workspace: {},
			collectionsLoaded: false,
			collectionsError: false,
			collections: []
		};
	}
	getData() {
		feathers_app.service('workspaces').get(this.state.id).then(result => {
			this.setState({workspace:result});
		}).catch(console.error);
		feathers_app.service('collections').find({query:{workspace:this.state.id, $sort:{position:1}}}).then(result => {
			this.setState({
				collectionsLoaded: true,
				collectionsError: false,
				collections: result
			});
		}).catch(error => {
			console.error(error);
			this.setState({
				collectionsLoaded: false,
				collectionsError: true,
				collections: []
			});
		});
	}
	createCollection() {
		let name = prompt('Name?');
		if (!name) return;
		let collection = {
			workspace: this.state.id,
			name: name,
			position: this.state.collections.length
		};
		feathers_app.service('collections').create(collection).catch(console.error);
	}
	moveCollection(e, data) {
		let move = (data.move == 'right')? 1: -1;
		feathers_app.service('collections').patch(null, {$inc: {position: -move}}, {query: {
			workspace: this.state.id,
			position: data.collection.position + move
		}}).then(result => {
			feathers_app.service('collections').patch(data.collection._id, {$inc: {position: move}}).catch(console.error);
		}).catch(console.error);
	}
	renameCollection(e, data) {
		let name = prompt('Name?');
		if (!name) return;
		feathers_app.service('collections').patch(data.collection._id, {name: name}).catch(console.error);
	}
	changeCollectionViewType(e, data) {
		let type = prompt('View Type?');
		if (!collectionViews[type]) { alert('invalid'); return; }
		if (['Board'].indexOf(type) != -1) {
			let boardField = prompt('On which field?');
			let cardField = prompt('Display which field as card title?');
			feathers_app.service('collections').patch(data.collection._id, {viewType: type, boardField: boardField, cardField: cardField}).catch(console.error);
		}
		else feathers_app.service('collections').patch(data.collection._id, {viewType: type}).catch(console.error);
	}
	removeCollection(e, data) {
		if (!confirm('Are you sure?')) return;
		feathers_app.service('collections').remove(data.collection._id).catch(console.error);
	}
	handleCreatedCollection(collection) {
		if (collection.workspace != this.state.id) return;
		this.setState({ collections: this.state.collections.concat(collection) });
	}
	handlePatchedCollection(collection) {
		for (let i in this.state.collections) {
			if (this.state.collections[i]._id == collection._id) {
				let newCollections = this.state.collections;
				newCollections[i] = Object.assign({}, collection);
				newCollections.sort((a,b) => { return a.position - b.position; });
				this.setState({ collections: newCollections });
				break;
			}
		}
	}
	handleRemovedCollection(collection) {
		for (let i in this.state.collections) {
			if (this.state.collections[i]._id == collection._id) {
				let newCollections = this.state.collections;
				newCollections.splice(i, 1)
				this.setState({ collections: newCollections });
				break;
			}
		}
	}
	handlePatchedWorkspace(workspace) {
		if (workspace._id == this.state.id) {
			this.setState({workspace:workspace});
		}
	}
	bindEventListeners() {
		this.collectionCreatedListener = this.handleCreatedCollection.bind(this);
		this.collectionPatchedListener = this.handlePatchedCollection.bind(this);
		this.collectionRemovedListener = this.handleRemovedCollection.bind(this);
		feathers_app.service('collections').on('created', this.collectionCreatedListener);
		feathers_app.service('collections').on('patched', this.collectionPatchedListener);
		feathers_app.service('collections').on('removed', this.collectionRemovedListener);
		this.workspacePatchedListener = this.handlePatchedWorkspace.bind(this);
		feathers_app.service('workspaces').on('patched', this.workspacePatchedListener);
	}
	componentDidMount() {
		this.getData();
		this.bindEventListeners();
	}
	componentWillUnmount() {
		feathers_app.service('collections').removeListener('created', this.collectionCreatedListener);
		feathers_app.service('collections').removeListener('patched', this.collectionPatchedListener);
		feathers_app.service('collections').removeListener('removed', this.collectionRemovedListener);
		feathers_app.service('workspaces').removeListener('patched', this.workspacePatchedListener);
	}
	render() {
		let that = this;
		let collectionTabs = this.state.collections.map(function(collection) {
			return (
				<li key={collection._id} className={(collection._id == that.props.params.collection)?'pure-menu-item pure-menu-selected':'pure-menu-item'} style={{height:that.state.itemHeight}}>
					<ContextMenuTrigger id={'collection'+collection._id}>
						<Link to={'/workspace/'+that.state.id+'/collection/'+collection._id} className="pure-menu-link tab" title={collection._id}>
							{collection.name}
						</Link>
					</ContextMenuTrigger>
					<ContextMenu id={'collection'+collection._id}>
						<MenuItem data={{collection: collection}} onClick={that.changeCollectionViewType.bind(that)}>
							Change View Type
						</MenuItem>
						{collection.position != that.state.collections.length-1 &&
							<MenuItem data={{move:'right', collection: collection}} onClick={that.moveCollection.bind(that)}>
								Move Right
							</MenuItem>
						}
						{collection.position != 0 &&
							<MenuItem data={{move:'left', collection: collection}} onClick={that.moveCollection.bind(that)}>
								Move Left
							</MenuItem>
						}
						<MenuItem data={{collection: collection}} onClick={that.renameCollection.bind(that)}>
							Rename Collection
						</MenuItem>
						<MenuItem data={{collection: collection}} onClick={that.removeCollection.bind(that)}>
							Delete Collection
						</MenuItem>
					</ContextMenu>
				</li>
			);
		});
		return (
			<div>

				<div className="pure-menu pure-menu-horizontal">
					<ul className="pure-menu-list">
						<li className="pure-menu-item">
							<Link to="/" className="pure-menu-link">&laquo; Home</Link>
						</li>
						<li className="pure-menu-item">
							<div className="pure-menu-heading">
								Workspace: <span style={{textTransform:'none'}} title={this.state.id}>{this.state.workspace.name}</span>
							</div>
						</li>
					</ul>
				</div>

				<StatusText
					loaded={this.state.collectionsLoaded}
					error={this.state.collectionsError}
					data={this.state.collections}
					nodatamessage='No Collections' />

				<div className="pure-menu pure-menu-horizontal pure-menu-scrollable nobottompadding">
					<div className="pure-menu-heading">Collections:</div>
					<ul className="pure-menu-list tabs">

						{collectionTabs}

					</ul>
					<ul className="pure-menu-list">
						<li className="pure-menu-item" style={{paddingLeft:'15px', height:this.state.itemHeight}}>
							<button className="pure-button" onClick={this.createCollection.bind(this)}>
								Add Collection
							</button>
						</li>
					</ul>
				</div>

				<div className="workspace">
					{this.props.children}
				</div>

			</div>
		);
	}
}

module.exports = withRouter(Workspace);
