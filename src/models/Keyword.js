'use strict'
const mongoose = require('mongoose'),
			Schema   = mongoose.Schema,
			Types    = mongoose.Schema.Types

export default new Schema({
														name        : Types.String,
														campaignUses: Types.Number,
														contentUses : Types.Number
													})
