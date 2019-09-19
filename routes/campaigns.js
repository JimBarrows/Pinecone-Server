/**
 * Created by JimBarrows on 8/17/16.
 */
'use strict';
import express         from "express"
import {Campaign}      from "pinecone-models"
import isAuthenticated from "../authentication"

const router = express.Router();

router.get('/', isAuthenticated, function (req, res) {
	Campaign
			.find({owner: req.user.id})
			.exec()
			.then((list) => {
				res.status(200).json(list).end();
			})
			.catch((error) => {
				console.log("Error retrieving campaign list for ", req.user.username, ".  ", error);
				res.status(400).end()
			});
});

router.post('/', isAuthenticated, function (req, res) {
	let rawCampaign   = req.body;
	rawCampaign.owner = req.user._id;
	Campaign.create(rawCampaign)
			.then((savedContent) => res.json(savedContent).status(200).end())
			.catch((error) => {
				console.log("Error creating campaign ", rawCampaign, " because ", error);
				res.status(400).end();
			});
});


module.exports = router;
