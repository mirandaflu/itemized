'use strict';

// collection-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const collectionSchema = new Schema({

	workspace: { type: Schema.ObjectId, ref: 'workspace', required: true },

	name: { type: String, required: true },
	position: { type: Number, required: true },

	defaultView: { type: Schema.ObjectId, ref: 'view' },

	createdAt: { type: Date, 'default': Date.now },
	updatedAt: { type: Date, 'default': Date.now }

});

const collectionModel = mongoose.model('collection', collectionSchema);

module.exports = collectionModel;
