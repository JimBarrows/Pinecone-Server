'use strict'
import mongoose from "mongoose"

const Schema = mongoose.Schema,
			Types  = mongoose.Schema.Types


const TwitterAccountInfo = new Schema({
																				accessToken      : Types.String,
																				accessTokenSecret: Types.String,
																				name             : Types.String,
																				ownerId          : Types.String,
																				owner            : Types.String
																			})

export default TwitterAccountInfo

