'use strict'
import mongoose from "mongoose"

const Schema = mongoose.Schema,
			Types  = mongoose.Schema.Types


const Objective = new Schema({
															 name       : Types.String,
															 description: Types.String,
															 met        : {type: Types.Boolean, default: false}
														 })

export default Objective
