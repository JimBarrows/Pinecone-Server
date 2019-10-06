'use strict'
import mongoose from "mongoose"

const Schema = mongoose.Schema,
			Types  = mongoose.Schema.Types

const Message = new Schema({
														 name        : Types.String,
														 description : Types.String,
														 campaignUses: Types.Number,
														 contentUses : Types.Number
													 })

export default Message
