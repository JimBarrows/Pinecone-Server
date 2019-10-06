const mongoose = require('mongoose')
	, Promise    = require('bluebird')

mongoose.Promise = Promise
mongoose.connect('mongodb://mongo/pinecone')

module.exports = mongoose
