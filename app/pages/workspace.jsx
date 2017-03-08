import React from 'react';
import { Link, withRouter } from 'react-router';
import Select from 'react-select';

import collectionViews from '../components/collectionviews/index.js';

import CollectionTab from '../components/collectiontab.jsx';
import StatusText from '../components/statustext.jsx';

class Workspace extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			id: this.props.routeParams.workspace,
			workspace: {},
			collectionsLoaded: false,
			collectionsError: false,
			collections: []
		};
	}
	getData() {
		feathers_app.service('workspaces').get(this.state.id).then(result => {
			document.title = result.name + ' | Itemized';
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
	goToCollection(o) {
		this.props.router.push('/workspace/'+this.state.id+'/collection/'+o.value);
	}
	createCollection() {
		let name = 'New Collection';
		let collection = {
			workspace: this.state.id,
			name: name,
			position: this.state.collections.length
		};
		feathers_app.service('collections').create(collection).then(result => {
			this.props.router.push('/workspace/' + this.state.id + '/collection/' + result._id + '/configure')
		}).catch(console.error);
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
	editCollection(id, patch) {
		feathers_app.service('collections').patch(id, patch).catch(console.error);
	}
	deleteCollection(id) {
		if (!confirm('Are you sure?')) return;
		feathers_app.service('collections').remove(id).then(result => {
			this.props.router.push('/workspace/' + this.state.id);
		}).catch(console.error);
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
		return (
			<div>

				<StatusText
					loaded={this.state.collectionsLoaded}
					error={this.state.collectionsError}
					data={this.state.collections}
					nodatamessage='' />

				<div id="collectionNavWide">
					<div className="pure-menu pure-menu-horizontal nobottompadding">
						<div className="pure-menu-heading bold">Collections:</div>
						<ul className="pure-menu-list">

							{this.state.collections.map(function(collection) {
								return (
									<CollectionTab
										key={collection._id}
										activeCollectionId={that.props.params.collection}
										workspace={that.state.workspace}
										collectionsLength={that.state.collections.length}
										collection={collection}
										onChange={that.editCollection.bind(that)}
										onMove={that.moveCollection.bind(that)}
										onDelete={that.deleteCollection.bind(that)} />
								);
							})}

						</ul>
						<div className="pure-menu-heading" style={{padding:0, paddingLeft:'15px'}}>
							<button className="pure-button button-secondary button-small" onClick={this.createCollection.bind(this)}>
								<i className="fa fa-plus" />
							</button>
						</div>
					</div>
				</div>
				<div id="collectionNavNarrow">
					Collection: <Select value={this.props.params.collection}
						options={this.state.collections.map(function(collection) {
							return {label: collection.name, value: collection._id}
						})}
						onChange={this.goToCollection.bind(this)}
						style={{}} />
					<button className="pure-button button-secondary button-small" onClick={this.createCollection.bind(this)}>
						<i className="fa fa-plus" />
					</button>
				</div>

				<div className="workspace withshadow">
					{this.props.children || ((this.state.collections.length == 0)?'Please create a collection':'Please select or create a collection')}
				</div>

			</div>
		);
	}
}

module.exports = withRouter(Workspace);
