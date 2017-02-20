import React from 'react';
import { Link } from 'react-router';

export default class ConfigureWorkspace extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			name: 'New Workspace'
		};
	}
	handleNameChange(e) {
		let name = e.target.value;
		this.setState({name:name});
		feathers_app.service('workspaces').patch(this.props.params.workspace, {name:name}).catch(console.error);
	}
	componentDidMount() {
		this.refs.nameInput.select();
	}
	render() {
		return(
			<div>
				<form className="pure-form pure-form-aligned">
					<fieldset>
						<div className="pure-control-group">
							<label htmlFor="name">Workspace Name</label>
							<input id="name" type="text"
								ref="nameInput"
								value={this.state.name}
								onChange={this.handleNameChange.bind(this)} />
						</div>
					</fieldset>
				</form>

				Choose Template:
				<br /><br />
				<Link className="pure-button" to={'/workspace/' + this.props.params.workspace}>Empty Workspace</Link>
			</div>
		);
	}
}
