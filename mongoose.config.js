import mongoose from "mongoose";

mongoose.Promise = require('bluebird');

mongoose.connect('mongodb://mongo/pinecone');

module.exports = mongoose;
