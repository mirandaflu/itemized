import React from 'react';
import Modal from 'react-modal';
import { Link, withRouter } from 'react-router';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

class WorkspaceItem extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			name: this.props.workspace.name,
			modalOpen: false
		}
	}
	startWorkspaceEdit(e) {
		e.preventDefault();
		this.setState({ modalOpen: true });
	}
	handleChange(e) {
		let s = {};
		s[e.target.id] = e.target.value;
		this.setState(s);
	}
	commitChange(e) {
		let s = {};
		s[e.target.id] = e.target.value;
		this.props.onChange(this.props.workspace._id, s);
	}
	handleDeleteClick(e) {
		e.preventDefault();
		this.props.onDelete(this.props.workspace);
	}
	closeModal() {
		this.setState({ modalOpen: false });
	}
	render() {
		return (
			<div className="pure-u-1 pure-u-sm-1-3 pure-u-lg-1-4">
				<Link to={'/workspace/'+this.props.workspace._id}>
					<div className="card withshadow">

						<button style={{marginTop:'-5.5px'}} className="pure-button button-small" onClick={this.startWorkspaceEdit.bind(this)}>
							<i className="fa fa-edit" />
						</button>

						{this.props.workspace.name}

						<Modal
							isOpen={this.state.modalOpen}
							contentLabel="Modal">
							<div className="modalContent">

								<button className="pure-button" onClick={this.closeModal.bind(this)}><i className="fa fa-close" /></button>
								<form className="pure-form pure-form-aligned">
									<fieldset>
										<div className="pure-control-group">
											<label htmlFor="name">Name</label>
											<input id="name"
												type="text"
												value={this.state.name}
												onChange={this.handleChange.bind(this)}
												onBlur={this.commitChange.bind(this)} />
										</div>
										<div className="pure-controls">
											<button className="pure-button button-error"
												onClick={this.handleDeleteClick.bind(this)}>
												Delete Workspace
											</button>
										</div>
									</fieldset>
								</form>

							</div>
						</Modal>

					</div>
				</Link>
			</div>
		);
	}
}

module.exports = withRouter(WorkspaceItem);
