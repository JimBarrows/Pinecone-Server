'use strict'
import mongoose from "mongoose"

const Schema = mongoose.Schema,
			Types  = mongoose.Schema.Types


const Tag = new Schema({
												 name        : Types.String,
												 campaignUses: Types.Number,
												 contentUses : Types.Number
											 })

export default Tag
