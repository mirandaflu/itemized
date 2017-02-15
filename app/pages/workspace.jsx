import React from 'react';
import { Link, withRouter } from 'react-router';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

import { arrayWithElementsSwapped, arrayWithElementRemoved } from '../functions/arrayutilities.js';
import StatusText from '../components/statustext.jsx';

class Workspace extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			itemHeight: '35px',
			id: this.props.routeParams.workspace,
			name: '',
			collectionsLoaded: false,
			collectionsError: false,
			collections: []
		};
	}
	addCollection() {
		let name = prompt('Name?');
		if (!name) return;
		let collection = {
			workspace: this.state.id,
			name: name,
			position: this.state.collections.length
		};
		feathers_app.service('collections').create(collection).then(result => {
			this.setState({
				collections: this.state.collections.concat(result)
			});
		}).catch(error => {
			console.error(error);
			this.setState({
				collectionsError: true
			});
		});
	}
	moveCollection(e, data) {
		console.log(data);
		let move = (data.move == 'right')? 1: -1;
		feathers_app.service('collections').patch(null, {$inc: {position: -move}}, {query: {
			workspace: this.state.id,
			position: data.collection.position + move
		}}).then(result => {
			feathers_app.service('collections').patch(data.collection._id, {$inc: {position: move}}).then(result => {
				this.setState({
					collections: arrayWithElementsSwapped(this.state.collections, data.collection.position, data.collection.position + move)
				});
			}).catch(console.error);
		}).catch(console.error);
	}
	renameCollection(e, data) {
		let name = prompt('Name?');
		if (!name) return;
		feathers_app.service('collections').patch(data.collection._id, {name: name}).then(result => {
			for (let i in this.state.collections) {
				if (this.state.collections[i]._id == data.collection._id) {
					let newCollections = this.state.collections;
					newCollections[i].name = name;
					this.setState({ collections: newCollections });
					break;
				}
			}
		}).catch(console.error);
	}
	removeCollection(e, data) {
		if (!confirm('Are you sure?')) return;
		feathers_app.service('collections').remove(data.collection._id).then(result => {
			this.setState({
				collections: arrayWithElementRemoved(this.state.collections, data.collection._id)
			});
		}).catch(console.error);
	}
	getData() {
		feathers_app.service('workspaces').get(this.state.id).then(result => {
			this.setState({name:result.name});
		});
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
	componentDidMount() {
		this.getData();
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
								Workspace: <span style={{textTransform:'none'}} title={this.state.id}>{this.state.name}</span>
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
							<button className="pure-button" onClick={this.addCollection.bind(this)}>
								Add Collection
							</button>
						</li>
					</ul>
				</div>

				{this.props.children}

			</div>
		);
	}
}

module.exports = withRouter(Workspace);
