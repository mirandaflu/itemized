import React from 'react';
import { Link } from 'react-router';

import collectionViews from '../components/collectionviews/index.js';

export default class CollectionTab extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			fields: [],
			name: this.props.collection.name,
			modalOpen: false
		};
	}
	getFields(collection) {
		feathers_app.service('fields').find({query:{coll:collection}})
			.then(result => { this.setState({fields: result}); })
			.catch(console.error);
	}
	render() {
		let collection = this.props.collection, that = this;
		return (
			<li className={(collection._id == this.props.activeCollectionId)?'pure-menu-item pure-menu-selected':'pure-menu-item'} style={{height:this.props.height}}>
				<Link to={'/workspace/'+this.props.workspace._id+'/collection/'+collection._id}>
					<div className="pure-menu-link" title={collection._id}>
						{collection.name}
					</div>
				</Link>
			</li>
		);
	}
}
