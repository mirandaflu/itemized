'use strict';

// attribute-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attributeSchema = new Schema({

	thing: { type: Schema.ObjectId, ref: 'thing', required: true },
	field: { type: Schema.ObjectId, ref: 'field', required: true },

	value: { type: Schema.Types.Mixed },

	createdAt: { type: Date, 'default': Date.now },
	updatedAt: { type: Date, 'default': Date.now }

});

const attributeModel = mongoose.model('attribute', attributeSchema);

module.exports = attributeModel;
