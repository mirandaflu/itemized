'use strict';

// workspace-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const workspaceSchema = new Schema({

	owner: { type: Schema.ObjectId, ref: 'user', required: true },
	admins: [ Schema.Types.ObjectId ],
	editors: [ Schema.Types.ObjectId ],
	viewers: [ Schema.Types.ObjectId ],

	name: { type: String, required: true, default: 'New Workspace' },

	createdAt: { type: Date, 'default': Date.now },
	updatedAt: { type: Date, 'default': Date.now }

});

const workspaceModel = mongoose.model('workspace', workspaceSchema);

module.exports = workspaceModel;
