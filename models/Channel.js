'use strict';
const mongoose = require('mongoose'),
      Schema   = mongoose.Schema,
      Types    = Schema.Types;

var WordPressDestination = new Schema({
	name: Types.String,
	username: Types.String,
	password: Types.String,
	url: Types.String
});

var Channel = new Schema({
	name: Types.String,
	owner: Types.ObjectId,
	wordPressDestinations: [WordPressDestination]
});

module.exports = mongoose.model('Channel', Channel);