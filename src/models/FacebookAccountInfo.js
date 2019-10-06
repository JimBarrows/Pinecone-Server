'use strict'
import mongoose from "mongoose"

const Schema = mongoose.Schema,
			Types  = mongoose.Schema.Types

const PageInfo = new Schema({
															accessToken: Types.String,
															category   : Types.String,
															name       : Types.String,
															pageId     : Types.String
														})

const FacebookAccountInfo = new Schema({
																				 accessToken: Types.String,
																				 name       : Types.String,
																				 pages      : [PageInfo]

																			 })

export default FacebookAccountInfo
