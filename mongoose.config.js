import mongoose from "mongoose";

mongoose.Promise = require('bluebird');

let db = mongoose.createConnection('mongodb://mongo/pinecone');

module.exports = db;
