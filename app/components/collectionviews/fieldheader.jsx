import React from 'react';
import Modal from 'react-modal';
import Select from 'react-select';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';

import fieldTypes from '../attributes/index.js';

export default class FieldHeader extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			modalOpen: false,
			name: this.props.field.name,
			type: this.props.field.type,
			options: this.props.field.options
		};
	}
	startFieldEdit() {
		this.setState({ modalOpen: true });
	}
	handleOptionsSelectChange(property, values) {
		let value = values.map(function(v) { return v.value; });
		let s = {};
		s[property] = value;
		this.setState(s);
		feathers_app.service('fields').patch(this.props.field._id, s).catch(console.error);
	}
	handleSelectChange(property, value) {
		let s = {};
		s[property] = value.value;
		this.setState(s);
		feathers_app.service('fields').patch(this.props.field._id, s).catch(console.error);
	}
	handleChange(e) {
		let s = {};
		s[e.target.id] = e.target.value;
		this.setState(s);
	}
	commitChange(e) {
		let s = {};
		s[e.target.id] = e.target.value;
		feathers_app.service('fields').patch(this.props.field._id, s).catch(console.error);
	}
	handleDeleteClick(e) {
		e.preventDefault();
		if (!confirm('Are you sure?')) return;
		feathers_app.service('fields').remove(this.props.field._id)
			.then(result => { this.closeModal() })
			.catch(console.error);
	}
	closeModal() {
		this.setState({ modalOpen: false });
	}
	componentWillReceiveProps(nextProps) {
		this.setState({
			name: nextProps.field.name,
			type: nextProps.field.type,
			options: nextProps.field.options
		});
	}
	render() {
		let field = this.props.field;
		let typeOptions = [], optionOptions = [];
		for (let t in fieldTypes) {
			typeOptions.push({value:t, label:t});
		}
		for (let o of this.state.options) {
			optionOptions.push({value:o, label:o});
		}
		return (
			<div>
				<ContextMenuTrigger id={'field'+field._id}>
					{field.name}
				</ContextMenuTrigger>
				<ContextMenu id={'field'+field._id}>
					<MenuItem onClick={this.startFieldEdit.bind(this)}>
						Edit
					</MenuItem>
					{field.position != this.props.fieldsLength-1 &&
						<MenuItem data={{move:'right', field: field}} onClick={this.props.onMove}>
							Move Right
						</MenuItem>
					}
					{field.position != 0 &&
						<MenuItem data={{move:'left', field: field}} onClick={this.props.onMove}>
							Move Left
						</MenuItem>
					}
				</ContextMenu>
				<Modal isOpen={this.state.modalOpen} contentLabel="Modal">
					<div className="modalContent">
						<button onClick={this.closeModal.bind(this)}><i className="fa fa-close" /></button>

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
								<div className="pure-control-group">
									<label htmlFor="type">Type</label>
									<Select
										id="type"
										value={this.state.type}
										options={typeOptions}
										clearable={false}
										onChange={this.handleSelectChange.bind(this, 'type')} />
								</div>
								{this.props.field.type.indexOf('Select') != -1 &&
									<div className="pure-control-group">
										<label htmlFor="options">Options</label>
										<Select.Creatable
											id="options"
											value={optionOptions}
											options={[]}
											multi={true}
											onChange={this.handleOptionsSelectChange.bind(this, 'options')} />
									</div>
								}
								<div className="pure-controls">
									<button className="pure-button button-error"
										onClick={this.handleDeleteClick.bind(this)}>
										Delete Field
									</button>
								</div>
							</fieldset>
						</form>


					</div>
				</Modal>
			</div>
		);
	}
}
