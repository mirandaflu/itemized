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
				<li key={collection._id} className="pure-menu-item" style={{height:that.state.itemHeight}}>
					<ContextMenuTrigger id={'collection'+collection._id}>
						<Link to={'/workspace/'+that.state.id+'/collection/'+collection._id} className="pure-menu-link">
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
						<MenuItem data={{collection: collection}} onClick={that.removeCollection.bind(that)}>
							Delete Collection
						</MenuItem>
					</ContextMenu>
				</li>
			);
		});
		return (
			<div>
				<Link to="/">Home</Link>
				<h2>{this.state.name}</h2>
				<h4>workspace {this.state.id}</h4>

					<StatusText
						loaded={this.state.collectionsLoaded}
						error={this.state.collectionsError}
						data={this.state.collections}
						nodatamessage='No Collections' />

				<div className="pure-menu pure-menu-horizontal pure-menu-scrollable">
					<div className="pure-menu-link pure-menu-heading">Collections:</div>
					<ul className="pure-menu-list">

						{collectionTabs}

						<li className="pure-menu-item" style={{height:this.state.itemHeight}}>
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
