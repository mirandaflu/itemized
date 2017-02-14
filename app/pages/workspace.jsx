import React from 'react';
import { Link, withRouter } from 'react-router';

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
			name: name,
			workspace: this.state.id
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
	getData() {
		feathers_app.service('workspaces').get(this.state.id).then(result => {
			this.setState({name:result.name});
		});
		feathers_app.service('collections').find({workspace:this.state.id}).then(result => {
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
					<Link to={'/workspace/'+that.state.id+'/collection/'+collection._id} className="pure-menu-link">
						{collection.name}
					</Link>
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
