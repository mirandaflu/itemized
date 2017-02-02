// user-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
	email: { type: String, lowercase: true, unique: true, trim: true, index: true, sparse: true },
	password: { type: String }
});

const userModel = mongoose.model('user', userSchema);

module.exports = userModel;
