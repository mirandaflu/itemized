import React from 'react';
import { withRouter } from 'react-router';
import Select from 'react-select';

import CollectionTab from 'components/collectiontab';
import MessageBanner from 'components/messagebanner';
import StatusText from 'components/statustext';

class Workspace extends React.Component {
	state = {
		id: this.props.routeParams.workspace,
		workspace: {},
		collectionsLoaded: false,
		collectionsError: false,
		collections: []
	}
	getData = () => {
		feathersApp.service('workspaces').get(this.state.id).then(result => {
			document.title = result.name + ' | Itemized';
			this.setState({workspace: result});
		}).catch(console.error);
		feathersApp.service('collections').find({query: {workspace: this.state.id, $sort: {position: 1}}}).then(result => {
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
	goToCollection = (option) => this.props.router.push('/workspace/' + this.state.id + '/collection/' + option.value);
	createCollection = () => {
		const name = 'New Collection';
		const collection = {
			workspace: this.state.id,
			name: name,
			position: this.state.collections.length
		};
		feathersApp.service('collections').create(collection).then(result => {
			this.props.router.push('/workspace/' + this.state.id + '/collection/' + result._id + '/configure');
		}).catch(console.error);
	}
	moveCollection = (event, data) => {
		const move = (data.move === 'right') ? 1 : -1;
		feathersApp.service('collections').patch(null, {$inc: {position: -move}}, {query: {
			workspace: this.state.id,
			position: data.collection.position + move
		}}).then(result => {
			feathersApp.service('collections').patch(data.collection._id, {$inc: {position: move}}).catch(console.error);
		}).catch(console.error);
	}
	editCollection = (id, patch) => feathersApp.service('collections').patch(id, patch).catch(console.error);
	deleteCollection = (id) => {
		if (!confirm('Are you sure?')) return;
		feathersApp.service('collections').remove(id).then(result => {
			this.props.router.push('/workspace/' + this.state.id);
		}).catch(console.error);
	}
	handleCreatedCollection = (collection) => {
		if (collection.workspace !== this.state.id) return;
		this.setState({ collections: this.state.collections.concat(collection) });
	}
	handlePatchedCollection = (collection) => {
		for (const i in this.state.collections) {
			if (this.state.collections[i]._id === collection._id) {
				const newCollections = this.state.collections;
				newCollections[i] = Object.assign({}, collection);
				newCollections.sort((a, b) => { return a.position - b.position; });
				this.setState({ collections: newCollections });
				break;
			}
		}
	}
	handleRemovedCollection = (collection) => {
		for (const i in this.state.collections) {
			if (this.state.collections[i]._id === collection._id) {
				const newCollections = this.state.collections;
				newCollections.splice(i, 1);
				this.setState({ collections: newCollections });
				break;
			}
		}
	}
	handlePatchedWorkspace = (workspace) => {
		if (workspace._id === this.state.id) {
			this.setState({ workspace: workspace });
		}
	}
	bindEventListeners() {
		feathersApp.service('collections').on('created', this.handleCreatedCollection);
		feathersApp.service('collections').on('patched', this.handlePatchedCollection);
		feathersApp.service('collections').on('removed', this.handleRemovedCollection);
		feathersApp.service('workspaces').on('patched', this.handlePatchedWorkspace);
	}
	componentDidMount() {
		this.getData();
		this.bindEventListeners();
	}
	componentWillUnmount() {
		feathersApp.service('collections').removeListener('created', this.handleCreatedCollection);
		feathersApp.service('collections').removeListener('patched', this.handlePatchedCollection);
		feathersApp.service('collections').removeListener('removed', this.handleRemovedCollection);
		feathersApp.service('workspaces').removeListener('patched', this.handlePatchedWorkspace);
	}
	render() {
		const that = this;
		const readOnly = this.state.workspace.viewers && this.state.workspace.viewers.indexOf(feathersApp.get('user')._id) !== -1;
		return (
			<div>

				<StatusText
					loaded={this.state.collectionsLoaded}
					error={this.state.collectionsError}
					data={this.state.collections}
					nodatamessage="" />

				<MessageBanner ref="messageBanner" />

				<div id="collectionNavWide">
					<div className="pure-menu pure-menu-horizontal nobottompadding">
						<div className="pure-menu-heading bold">Collections:</div>
						<ul className="pure-menu-list">

							{this.state.collections.map(collection => {
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
						<div className="pure-menu-heading" style={{padding: 0, paddingLeft: '15px'}}>
							<button className="pure-button button-secondary button-small"
								onClick={this.createCollection} disabled={readOnly}>
								<i className="fa fa-plus" />
							</button>
						</div>
					</div>
				</div>
				<div id="collectionNavNarrow">
					Collection: <Select value={this.props.params.collection}
						options={this.state.collections.map(collection => {
							return {label: collection.name, value: collection._id};
						})}
						onChange={this.goToCollection}
						style={{}} />
					<button className="pure-button button-secondary button-small" onClick={this.createCollection}>
						<i className="fa fa-plus" />
					</button>
				</div>

				<div className="workspace withshadow">
					{(this.props.children) ?
						React.Children.map(this.props.children, child => React.cloneElement(child, {
							collectionsLength: this.state.collections.length,
							messageBanner: this.refs.messageBanner,
							readOnly: readOnly
						})) :
						((this.state.collections.length === 0) ? 'Please create a collection' : 'Please select or create a collection')}
				</div>

			</div>
		);
	}
}

module.exports = withRouter(Workspace);
