"use strict";
import {Account} from "@reallybigtree/pinecone-models";
import axios from "axios";
import Configuration from "../configurations";
import express from "express";
import moment from "moment";
import mongoose from "mongoose";
import passport from "passport";
import querystring from "querystring";
import obtainRequestTokenFromTwitter from "../twitterApi/TwitterApi";
const isAuthenticated = require('../authentication');

const env                   = process.env.NODE_ENV || "development";
const router                = express.Router();
const {ObjectId}            = mongoose.Types;
const twitterConfiguration  = Configuration[env].twitter;
const facebookConfiguration = Configuration[env].facebook;

/* GET users listing. */
router.get('/', isAuthenticated, function (req, res) {
	res.json(req.user).status(200).end();
});

router.delete("/asset/:assetId", isAuthenticated, function (req, res) {
	Account.findOneAndUpdate({_id: req.user._id}, {
		"$pull": {
			"assets": {_id: new ObjectId(req.params.assetId)}
		}
	}).then(() => res.status(200).end());
});

router.put("/asset/:assetId", isAuthenticated, function (req, res) {
	Account.findOneAndUpdate({_id: req.user._id, "assets._id": req.params.assetId}, {
		"$set": {
			"assets.$": req.body
		}
	}).then(() => res.status(200).end());
});

router.post("/assets", isAuthenticated, function (req, res) {
	Account.findByIdAndUpdate(req.user._id, {
		$push: {assets: req.body}
	}).then(() => res.status(200).end());
});

router.delete("/destination/:id", isAuthenticated, function (req, res) {
	Account.findOneAndUpdate({_id: req.user._id}, {
		"$pull": {
			"destinations": {_id: new ObjectId(req.params.id)}
		}
	}).then(() => res.status(200).end());
});

router.put("/destination/:id", isAuthenticated, function (req, res) {
	Account.findOneAndUpdate({_id: req.user._id, "destinations._id": req.params.id}, {
		"$set": {
			"destinations.$": req.body
		}
	}).then(() => res.status(200).end());
});

router.post("/destinations", isAuthenticated, function (req, res) {
	Account.findByIdAndUpdate(req.user._id, {
		$push: {destinations: req.body}
	}).then(() => res.status(200).end());
});

router.delete("/facebookAccount/:id", isAuthenticated, function (req, res) {
	Account.findOneAndUpdate({_id: req.user._id}, {
		"$pull": {
			"facebookAccounts": {_id: new ObjectId(req.params.id)}
		}
	}).then(() => res.status(200).end())
			.catch(function (error) {
				console.log("Error: ", error);
				res.send(error.data).status(400).end();
			});
});

function getPages(accessToken) {
	return axios.get("https://graph.facebook.com/me/accounts", {
		params: {
			client_id: facebookConfiguration.clientId,
			client_secret: facebookConfiguration.clientSecret,
			access_token: accessToken
		}
	});
}

function convertCodeToAccessToken(code) {
	return axios.get(`https://graph.facebook.com/oauth/access_token?client_id=${facebookConfiguration.clientId}&client_secret=${facebookConfiguration.clientSecret}&code=${code}&redirect_uri=${encodeURIComponent(facebookConfiguration.finishUrl)}`);
}

function convertShortTermAccessTokenToLongTermAccesstoken(accessToken) {
	return axios.get("https://graph.facebook.com/oauth/access_token", {
		params: {
			grant_type: "fb_exchange_token",
			client_id: facebookConfiguration.clientId,
			client_secret: facebookConfiguration.clientSecret,
			fb_exchange_token: accessToken
		}
	})
}

function getLongTermAccessToken(code) {
	return convertCodeToAccessToken(code)
			.then((response) => convertShortTermAccessTokenToLongTermAccesstoken(response.data.split('=')[1]))
}

router.get("/facebookAccount/finish", isAuthenticated, function (req, res) {
	getLongTermAccessToken(req.query.code)
			.then((response) => {
				let longTermAccessToken = response.data.split('=')[1];
				let updatedAccount      = Account.findOneAndUpdate({
					_id: req.user._id,
					"facebookAccounts.accessToken": ""
				}, {'facebookAccounts.$.accessToken': longTermAccessToken}, {fields: {'facebookAccounts.$': 1}});
				return Promise.all([getPages(longTermAccessToken), updatedAccount]);
			})
			.then((values) => Account.findOneAndUpdate({
						"_id": values[1]._id,
						"facebookAccounts._id": values[1].facebookAccounts[0]._id
					}, {
						'$set': {
							'facebookAccounts.$.pages': values[0].data.data.map((p) => ({
								"accessToken": p.access_token,
								"category": p.category,
								"name": p.name,
								"pageId": p.id
							}))
						}
					})
			)
			.then(() => res.redirect("/#/settings").end())
			.catch((error)=>res.json(error).status(400).end());
});

router.put("/facebookAccount/:id", isAuthenticated, function (req, res) {
	Account.findOneAndUpdate({_id: req.user._id, "twitterAccounts._id": req.params.id}, {
				"$set": {
					"facebookAccounts.$": req.body
				}
			})
			.then(() => res.status(200).end())
			.catch(function (error) {
				res.send(error.data).status(400).end();
			});
});

router.post("/facebookAccounts", isAuthenticated, function (req, res) {
	let facebookAccount = req.body;
	let userId          = req.user._id;
	Account.findByIdAndUpdate(userId, {$push: {facebookAccounts: facebookAccount}})
			.then(() => {
				res.status(201).end()
			})
			.catch((error) => {
				console.log("error: ", error);
				res.status(400).json(error).end();
			});
});


router.put('/facebookId', isAuthenticated, function (req, res) {
	const owner                                    = req.user.id;
	const {facebookUserId, accessToken, expiresIn} = req.body;

	axios.get("https://graph.facebook.com/oauth/access_token", {
				params: {
					grant_type: "fb_exchange_token",
					client_id: "1236802509686356",
					client_secret: "80fd99d15c54490d6558e3883c1bc40f",
					fb_exchange_token: accessToken
				}
			})
			.then((response) => {
				const longTermToken = querystring.parse(response.data);
				return Account.findOneAndUpdate({_id: owner}, {
					facebookUserId,
					accessToken: longTermToken.access_token,
					expiresIn: moment().add(longTermToken.expires, 'ms')
				}).exec()
			})
			.then(() => {
				res.status(200).end()
			})
			.catch((error) => {
				console.log("Error updating account ", owner, " with error ", error);
				res.status(400).end();
			});
});

router.delete("/keyword/:id", isAuthenticated, function (req, res) {
	Account.findOneAndUpdate({_id: req.user._id}, {
		"$pull": {
			"keywords": {_id: new ObjectId(req.params.id)}
		}
	}).then(() => res.status(200).end());
});

router.put("/keyword/:id", isAuthenticated, function (req, res) {
	Account.findOneAndUpdate({_id: req.user._id, "keywords._id": req.params.id}, {
		"$set": {
			"keywords.$": req.body
		}
	}).then(() => res.status(200).end());
});

router.post("/keywords", isAuthenticated, function (req, res) {
	Account.findByIdAndUpdate(req.user._id, {
		$push: {keywords: req.body}
	}).then(() => res.status(200).end());
});

router.post('/login', passport.authenticate('local'), function (req, res) {
	res.json(req.user).status(200).end();
});

router.get('/logout', function (req, res) {
	req.logout();
	res.status(200).end();
});


router.delete("/message/:id", isAuthenticated, function (req, res) {
	Account.findOneAndUpdate({_id: req.user._id}, {
		"$pull": {
			"messages": {_id: new ObjectId(req.params.id)}
		}
	}).then(() => res.status(200).end());
});

router.put("/message/:id", isAuthenticated, function (req, res) {
	Account.findOneAndUpdate({_id: req.user._id, "messages._id": req.params.id}, {
		"$set": {
			"messages.$": req.body
		}
	}).then(() => res.status(200).end());
});

router.post("/messages", isAuthenticated, function (req, res) {
	Account.findByIdAndUpdate(req.user._id, {
		$push: {messages: req.body}
	}).then(() => res.status(200).end());
});

router.get('/pageAcccessToken/:pageId', isAuthenticated, (req, res) => {
	let {pageId} = req.params;
	let user     = req.user;
	axios.get("https://graph.facebook.com/" + pageId, {
				params: {
					fields: "access_token",
					access_token: user.accessToken
				}
			})
			.then((response) => res.json({accessToken: response.data.access_token}).status(200).end())
			.catch((error) => {
				console.log("Couldn't get page access token for ", pageId, " because ", error);
				res.status(400).end();
			});
});

router.post('/register', function (req, res) {
	Account.register(new Account({
		username: req.body.username
	}), req.body.password, function (err, account) {
		if (err) {
			console.log("While registering, could not register user because ", err);
			res.json({error: err.message}).status(400).end();
		}
		passport.authenticate('local')(req, res, function () {
			req.session.save(function (err) {
				if (err) {
					console.log("While registering, could not manually authenticate user because ", err);
					res.json({error: err.message}).status(400).end();
				}
				res.json(account).status(200).end();
			});
		});
	});
});

router.delete("/twitterAccount/:id", isAuthenticated, function (req, res) {
	Account.findOneAndUpdate({_id: req.user._id}, {
		"$pull": {
			"twitterAccounts": {_id: new ObjectId(req.params.id)}
		}
	}).then(() => res.status(200).end())
			.catch(function (error) {
				console.log("Error: ", error);
				res.send(error.data).status(400).end();
			});
});

router.get("/twitterAccount/finish", isAuthenticated, function (req, res) {
	Account.findById(req.user._id)
			.then((account)=> {
				let twitterAccount = account.twitterAccounts.find((acc) => !(acc.accessToken && acc.accessTokenSecret));
				if (twitterAccount) {
					twitterAccount.accessToken       = req.query.oauth_token;
					twitterAccount.accessTokenSecret = req.query.oauth_verifier;
				}
				return account.save();
			})
			.then(() => res.redirect("/#/settings").end())
			.catch((error) => {
				console.log("/twitterAccount/finish error: ", error);
				res.status(400).end();
			});
});

router.put("/twitterAccount/:id", isAuthenticated, function (req, res) {
	Account.findOneAndUpdate({_id: req.user._id, "twitterAccounts._id": req.params.id}, {
				"$set": {
					"twitterAccounts.$": req.body
				}
			})
			.then(() => res.status(200).end())
			.catch(function (error) {
				console.log("Error: ", error);
				res.send(error.data).status(400).end();
			});
});

router.post("/twitterAccounts", isAuthenticated, function (req, res) {
	let twitterAccount = req.body;

	Account.findByIdAndUpdate(userId, {$push: {twitterAccounts: twitterAccount}})
			.then(() => obtainRequestTokenFromTwitter(userId))
			.then((response) => res.json(querystring.parse(response.data)).status(200).end())
			.catch(function (error) {
				res.send(error).status(400).end();
			});
});

router.delete("/wordpressAccount/:id", isAuthenticated, function (req, res) {
	Account.findOneAndUpdate({_id: req.user._id}, {
		"$pull": {
			"wordpressAccounts": {_id: new ObjectId(req.params.id)}
		}
	}).then(() => res.status(200).end())
			.catch(function (error) {
				console.log("Error: ", error);
				res.send(error.data).status(400).end();
			});
});

router.put("/wordpressAccount/:id", isAuthenticated, function (req, res) {
	Account.findOneAndUpdate({_id: req.user._id, "wordpressAccounts._id": req.params.id}, {
		"$set": {
			"wordpressAccounts.$": req.body
		}
	}).then(() => res.status(200).end())
			.catch(function (error) {
				console.log("Error: ", error);
				res.send(error.data).status(400).end();
			});
});

router.post("/wordpressAccounts", isAuthenticated, function (req, res) {
	Account
			.findByIdAndUpdate(req.user._id, {
				$push: {wordpressAccounts: req.body}
			})
			.then(() => res.status(200).end())
			.catch(function (error) {
				console.log("Error: ", error);
				res.send(error.data).status(400).end();
			});
});

module.exports = router;
