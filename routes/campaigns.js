/**
 * Created by JimBarrows on 8/17/16.
 */
'use strict';
import {Campaign} from "@reallybigtree/pinecone-models";
import express from "express";
import isAuthenticated from "../authentication";

console.log("booger");
const router = express.Router();

router.get('/', isAuthenticated, function (req, res) {
	Campaign
			.find({owner: req.user.id})
			.exec()
			.then((list) => res.status(200).json(list).end())
			.catch((error) => {
				console.log("Error retrieving campaign list for ", req.user.username, ".  ", error);
				res.status(400).end()
			});
});

module.exports = router;