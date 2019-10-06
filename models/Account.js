'use strict'
import mongoose              from "mongoose"
import PassportLocalMongoose from "passport-local-mongoose"
import Asset                 from "./Asset"
import Destination           from "./Destination"
import FacebookAccountInfo   from "./FacebookAccountInfo"
import Keyword               from "./Keyword"
import Message               from "./Message"
import TwitterAccountInfo    from "./TwitterAccountInfo"
import WordpressAccountInfo  from "./WordpressAccountInfo"

const Schema = mongoose.Schema

export const AccountSchema = new Schema({
																					assets           : [Asset],
																					destinations     : [Destination],
																					facebookAccounts : [FacebookAccountInfo],
																					keywords         : [Keyword],
																					messages         : [Message],
																					twitterAccounts  : [TwitterAccountInfo],
																					wordpressAccounts: [WordpressAccountInfo]
																				})

AccountSchema.plugin(PassportLocalMongoose)

const Account = mongoose.model('Account', AccountSchema)

export default Account
