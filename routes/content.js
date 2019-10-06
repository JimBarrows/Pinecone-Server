'use strict'
const express         = require('express'),
			passport        = require('passport'),
			isAuthenticated = require('../authentication'),
			router          = express.Router()
import mongoose  from "mongoose"
import * as send from "../messaging/send"
import {Content} from "../models"

const {Types} = mongoose.Schema


router.get('/', isAuthenticated, function (req, res) {
	Content.find({owner: req.user._id}).exec()
		.then((contentList) => {
			res.status(200).json(contentList).end()
		})
		.catch((error) => {
			console.log("Error retrieving content for ", req.user.id, " error: ", error)
			res.status(400).end()
		})
})

router.post('/', isAuthenticated, function (req, res) {
	let content        = req.body
	content.createDate = new Date(content.createDate)
	content.owner      = req.user._id
	Content.create(content)
		.then((savedContent) => {
			send.toWordPress(savedContent._id)
			send.toFacebook((savedContent._id))
			send.toTwitter((savedContent._id))
			res.status(200).json(savedContent).end()
		})
		.catch((error) => {
			console.log("Error creating content ", content, ".  ", error)
			res.status(400).end()
		})
})

router.put('/:contentId', isAuthenticated, function (req, res) {
	let {contentId} = req.params
	Content.findOneAndUpdate({_id: contentId}, req.body)
		.exec()
		.then((savedContent) => {
			send.toFacebook((savedContent._id))
			res.status(200).end()
		})
		.catch((error) => {
			console.log("Couldn't update the content ", req.body, " because ", error)
			res.status(400).end()
		})
})

router.delete('/:contentId', isAuthenticated, function (req, res) {
	let {contentId} = req.params
	Content.remove({_id: contentId})
		.then(() => res.status(200).end())
		.catch((error) => {
			console.log("Couldn't delete content ", contentId, " becuase ", error)
			res.status(400).end()
		})
})

router.get('/ping', function (req, res) {
	res.status(200).send("pong!")
})


module.exports = router
