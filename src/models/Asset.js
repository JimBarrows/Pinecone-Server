'use strict'
'use strict'
import mongoose from "mongoose"

const Schema = mongoose.Schema,
			Types  = mongoose.Schema.Types


const Asset = new Schema({
													 name        : Types.String,
													 description : Types.String,
													 url         : Types.String,
													 type        : Types.String,
													 size        : Types.Number,
													 version     : Types.Number,
													 campaignUses: Types.Number,
													 contentUses : Types.Number
												 })

export default Asset
