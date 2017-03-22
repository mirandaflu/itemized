'use strict';

// view-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const viewSchema = new Schema({

	name: { type: String },
	coll: { type: Schema.ObjectId, ref: 'collection', required: true },
	default: { type: Boolean },

	viewType: { type: String, required: true, default: 'Table' },
	boardField: { type: Schema.ObjectId, ref: 'field' },
	cardField: { type: Schema.ObjectId, ref: 'field' },
	swimLane: { type: Schema.ObjectId, ref: 'field' },
	dateField: { type: Schema.ObjectId, ref: 'field' }

});

const viewModel = mongoose.model('view', viewSchema);

module.exports = viewModel;
