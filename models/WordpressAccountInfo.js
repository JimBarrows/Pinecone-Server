'use strict'
import mongoose from "mongoose"

const Schema = mongoose.Schema,
			Types  = mongoose.Schema.Types

//Always make sure this file is WordpressAccountInfo.js, and not WordPressAccountInfo.js or things will break

const WordpressAccountInfo = new Schema({
																					name    : Types.String,
																					username: Types.String,
																					password: Types.String,
																					url     : Types.String
																				})

export default WordpressAccountInfo
