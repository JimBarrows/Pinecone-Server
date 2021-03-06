/**
 * Created by JimBarrows on 8/17/16.
 */
'use strict';
import express         from "express"
import isAuthenticated from "../authentication"
import {Campaign}      from "../models"

const router = express.Router();

router.delete("/:campaignId", isAuthenticated, function (req, res) {
	let {campaignId} = req.params;
	Campaign.deleteOne({_id: campaignId})
			.then(() => res.status(200).end())
			.catch((error) => {
				console.log("Couldn't delete campaign ", contentId, " becuase ", error);
				res.status(400).end();
			})
});

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

router.put('/:campaignId', isAuthenticated, function (req, res) {
	const campaignId = req.params.campaignId;
	if (req.body.owner == req.user._id) {
		Campaign.findOneAndUpdate({_id: campaignId, owner: req.user._id}, req.body, {new: true})
				.then((updated) => updated ? res.json(updated).status(200).end() : res.status(404).end())
				.catch((error) => {
					console.log("Could not find one and update for id ", campaignId, " and body of ", req.body, " because ", error);
					res.status(400).end();
				});
	} else {
		res.status(400).end();
	}

});

router.post('/:campaignId/blogPosts', isAuthenticated, function (req, res) {
	let {campaignId} = req.params;
	Campaign.findByIdAndUpdate(campaignId, {$push: {"blogPosts": req.body}}, {new: true})
			.exec()
			.then((savedCampaign)=> {
				savedCampaign ? res.json(savedCampaign).status(200).end() : res.status(404).end()
			})
			.catch((error)=>res.status(400).json(error).end());
});

router.put('/:campaignId/blogPosts/:blogPostId', isAuthenticated, function (req, res) {
	let {campaignId, blogPostId} = req.params;
	Campaign.findOneAndUpdate({
				_id: campaignId,
				owner: req.user._id,
				"blogPosts._id": blogPostId
			}, {"$set": {"blogPosts.$": req.body}}, {new: true})
			.exec()
			.then((savedCampaign)=>savedCampaign ? res.status(200).json(savedCampaign).end() : res.status(404).end())
			.catch((error)=>res.status(400).json(error).end());
});

router.delete('/:campaignId/blogPosts/:blogPostId', isAuthenticated, function (req, res) {
	let {campaignId, blogPostId} = req.params;
	Campaign.findOne({
				_id: campaignId,
				owner: req.user._id
			})
			.then((campaign)=> {
				if (campaign) {
					campaign.blogPosts.id(blogPostId).remove();
					return campaign.save();
				} else {
					return Promise.reject("couldn't find");
				}
			})
			.then((updatedCampaign) => res.status(200).json(updatedCampaign).end())
			.catch((error)=> {
				if (error === "couldn't find") {
					res.status(404).end()
				} else {
					res.status(400).json(error).end()
				}
			});
})
;
module.exports = router;
