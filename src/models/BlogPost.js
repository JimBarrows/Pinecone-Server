'use strict'
import mongoose             from "mongoose"
import WordpressAccountInfo from "./WordpressAccountInfo"

const Schema = mongoose.Schema,
			Types  = Schema.Types

const WordPressFieldsSchema = new Schema({
																					 excerpt          : Types.String,
																					 status           : Types.String,
																					 format           : Types.String,
																					 useBody          : {type: Types.Boolean, default: true},
																					 count            : {type: Types.Number, default: 140},
																					 typeToCount      : {
																						 type   : Types.String,
																						 enum   : ['characters', 'words', 'sentences'],
																						 default: 'characters'
																					 },
																					 wordPressAccounts: [WordpressAccountInfo]
																				 })

const TwitterFieldsSchema = new Schema({
																				 status  : Types.String,
																				 useTitle: {
																					 type: Types.Boolean, default: true
																				 }
																			 })

const FacebookFieldsSchema = new Schema({
																					post   : Types.String,
																					useBody: {type: Types.Boolean, default: true}
																				})

const TransmissionReportSchema = new Schema({
																							channel      : Types.ObjectId,
																							destination  : Types.ObjectId,
																							timeStart    : Types.Date,
																							timeEnd      : Types.Date,
																							status       : Types.String,
																							error        : Types.String,
																							destinationId: Types.String
																						})

const BlogPostSchema = new Schema({
																		body               : Types.String,
																		createDate         : Types.Date,
																		facebook           : FacebookFieldsSchema,
																		owner              : Types.ObjectId,
																		publishDate        : Types.Date,
																		slug               : Types.String,
																		title              : Types.String,
																		transmissionReports: [TransmissionReportSchema],
																		twitter            : TwitterFieldsSchema,
																		wordpress          : WordPressFieldsSchema
																	})

export default BlogPostSchema
