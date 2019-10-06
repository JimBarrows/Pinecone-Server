'use strict'
import mongoose from "mongoose"

const Schema = mongoose.Schema,
			Types  = mongoose.Schema.Types

const Destination = new Schema({
																 name        : Types.String,
																 type        : Types.String,
																 url         : Types.String,
																 campaignUses: Types.Number
															 })

export default Destination
