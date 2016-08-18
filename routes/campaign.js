/**
 * Created by JimBarrows on 8/17/16.
 */
'use strict';
import {Campaign} from "@reallybigtree/pinecone-models";
import express from "express";
import isAuthenticated from "../authentication";

const router = express.Router();

router.get('/:campaignId', isAuthenticated, function (req, res) {
	const campaignId = req.params.campaignId;
	Campaign.findOne({_id: campaignId, owner: req.user._id})
			.exec()
			.then((found) => {
				if (found) {
					res.json(found).status(200).end();
				} else {
					res.status(404).end();
				}

			})
			.catch((error) => {
				console.log("Error finding campaign ", campaignId, " for ", req.user.id, " because ", error);
				res.status(400).end()
			})
});

module.exports = router;