"use strict";
import {Account} from "@reallybigtree/pinecone-models";
import axios from "axios";
import express from "express";
import moment from "moment";
import mongoose from "mongoose";
import passport from "passport";
import querystring from "querystring";
import OAuth from "oauth-1.0a";

const router          = express.Router();
const isAuthenticated = require('../authentication');
const {ObjectId}      = mongoose.Types;

/* GET users listing. */
router.get('/', isAuthenticated, function (req, res) {
	res.json(req.user).status(200).end();
});

router.post("/assets", isAuthenticated, function (req, res) {
	Account.findByIdAndUpdate(req.user._id, {
		$push: {assets: req.body}
	}).then(() => res.status(200).end());
});

router.put("/asset/:assetId", isAuthenticated, function (req, res) {
	Account.findOneAndUpdate({_id: req.user._id, "assets._id": req.params.assetId}, {
		"$set": {
			"assets.$": req.body
		}
	}).then(() => res.status(200).end());
});

router.delete("/asset/:assetId", isAuthenticated, function (req, res) {
	Account.findOneAndUpdate({_id: req.user._id}, {
		"$pull": {
			"assets": {_id: new ObjectId(req.params.assetId)}
		}
	}).then(() => res.status(200).end());
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

router.post('/login', passport.authenticate('local'), function (req, res) {
	res.json(req.user).status(200).end();
});

router.get('/logout', function (req, res) {
	req.logout();
	res.status(200).end();
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

router.get('/twitterAccount', function (req, res) {
	const oauth = OAuth({
		consumer: {
			public: "CEmmg8lwj4OQsTEw9orBF7VAc",
			secret: "YrKdLxTB74VPrg1o4wsaK8moPEKG4bNmK6vawvlAgmSUoVuGBY"
		}
	});
	axios.post('https://api.twitter.com/oauth/request_token', {}, {
				headers: oauth.toHeader(
						oauth.authorize({
									url: 'https://api.twitter.com/oauth/request_token',
									method: 'POST'
								},
								{}))
			})
			.then(function (response) {
				res.send(querystring.parse(response.data)).status(200).end();
			})
			.catch(function (error) {
				console.log("Error: ", error);
				res.send(error.data).status(400).end();
			});
});

module.exports = router;
