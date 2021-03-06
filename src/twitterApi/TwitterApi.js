/**
 * Created by JimBarrows on 8/31/16.
 */
'use strict'
import axios  from "axios"
import OAuth  from "oauth-1.0a"
import config from "../config"

module.exports = function (userId) {
	const oauth     = OAuth({
														consumer: {
															"public": config.twitter.publicKey,
															"secret": config.twitter.secretKey
														}
													})
	const authorize = oauth.authorize({
																			url   : config.twitter.requestTokenUrl,
																			method: config.twitter.requestTokenUrlMethod
																		},
																		{})

	let header            = oauth.toHeader(authorize)
	header.oauth_callback = encodeURIComponent(config.twitter.finishUrl + "/" + userId)
	return axios.post(config.twitter.requestTokenUrl, {}, {headers: header})
}
