import React from 'react';
import Modal from 'react-modal';
import { Link } from 'react-router';

export default class ConfigureCollection extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			name: 'New Collection',
			modalOpen: true
		};
	}
	handleNameChange(e) {
		let name = e.target.value;
		this.setState({name:name});
		feathers_app.service('collections').patch(this.props.params.collection, {name:name}).catch(console.error);
	}
	componentDidMount() {
		this.refs.nameInput.select();
	}
	render() {
		return (
			<Modal isOpen={this.state.modalOpen} contentLabel="Modal">
				<form className="pure-form pure-form-aligned">
					<fieldset>
						<div className="pure-control-group">
							<label htmlFor="name">Collection Name</label>
							<input id="name" type="text"
								ref="nameInput"
								value={this.state.name}
								onChange={this.handleNameChange.bind(this)} />
						</div>
					</fieldset>
				</form>

				Choose Template:
				<br /><br />
				<Link className="pure-button" to={'/workspace/' + this.props.params.workspace + '/collection/' + this.props.params.collection}>Empty Collection</Link>
			</Modal>
		);
	}
}
