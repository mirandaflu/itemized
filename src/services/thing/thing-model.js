'use strict';

// thing-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const thingSchema = new Schema({

	coll: { type: Schema.ObjectId, ref: 'collection', required: true },
	listPosition: { type: Number, default: Infinity },

	createdAt: { type: Date, 'default': Date.now },
	updatedAt: { type: Date, 'default': Date.now }

});

const thingModel = mongoose.model('thing', thingSchema);

module.exports = thingModel;
