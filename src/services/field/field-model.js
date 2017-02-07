'use strict';

// field-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fieldSchema = new Schema({

	coll: { type: Schema.ObjectId, ref: 'collection', required: true },

	name: { type: String, required: true },
	type: { type: String },

	createdAt: { type: Date, 'default': Date.now },
	updatedAt: { type: Date, 'default': Date.now }

});

const fieldModel = mongoose.model('field', fieldSchema);

module.exports = fieldModel;
