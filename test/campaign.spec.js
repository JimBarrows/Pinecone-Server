/**
 * Created by JimBarrows on 8/18/16.
 */
'use strict'

import chai                                                                     from "chai"
import {Account, Campaign}                                                      from "../models"
import {cleanDatabase, createAccount, createApiClient, hash, login, salt, user} from "./support/fixtures"

const expect = chai.expect

describe("/campaign/:campaignId", function () {

	let campaign     = {}
	let client       = {}
	let loggedInUser = {}

	let createCampaign = function () {
		return Campaign.create({
														 name : 'Test Campaign 1',
														 owner: loggedInUser._id
													 })
	}

	beforeEach(async function () {
		client = await createApiClient()
		await cleanDatabase()
		await createAccount()
		loggedInUser = await login(client)
	})

	describe("delete method", function () {

		beforeEach(async function () {
			campaign = await Campaign.create({
																				 name : 'Test Campaign 1',
																				 owner: loggedInUser._id
																			 })
		})

		it("must delete the campaign from the database", async () => {
			const response = await client.delete('/campaign/' + campaign._id, {withCredentials: true})
			expect(response.status).to.be.equal(200)
			const campaignInDatastore = await Campaign.findById(campaign._id)
			expect(campaignInDatastore).to.be.null

		})
	})

	describe("get method", function () {

		beforeEach(async function () {
			const campaign = await createCampaign()
		})

		it("must retrieve the campaign specified by the id", async function () {
			const response = await client.get('/campaign/' + campaign._id)
			expect(response.status).to.be.equal(200)
			expect(response.data).to.exist
			expect(response.data.name).to.be.equal(campaign.name)

		})

		it("must 404 if the campaign is not owned by the logged in user", async function () {
			const newAccount         = await Account.create({username: user.username + "2", hash, salt})
			const newAccountCampaign = await Campaign.create({
																												 name : 'Test Campaign 2',
																												 owner: newAccount._id
																											 })
			const response           = await client.get('/campaign/' + newAccountCampaign._id)
			expect(response.status).to.be.equal(404)
		})
	})

	describe('put method', function () {

		beforeEach(async function () {
			const campaign = await createCampaign()
		})

		it("must update the campaign", async function () {
			let updatedCampaign = {
				name : 'Test Campaign 1 updated',
				owner: loggedInUser._id,
				_id  : campaign._id
			}
			const response      = await client.put('/campaign/' + campaign._id, updatedCampaign)
			expect(response.status).to.be.equal(200)
			const found = await Campaign.findById(campaign._id)
			expect(found.name).to.be.equal(updatedCampaign.name)

		})

		it("must return a status of 400 if the campaign being updated is not owned by the logged in user.", async function () {
			const newAccount  = await Account.create({username: user.username + "2", hash, salt})
			const newCampaign = await Campaign.create({name: 'Test Campaign 2', owner: newAccount._id})
			const response    = await client.put('/campaign/' + newCampaign._id, {
				name : 'Test Campaign 2 updated',
				owner: newCampaign.owner,
				_id  : newCampaign._id
			})
			expect(response.status).to.be.equal(400)
		})

		it("must not override the owner.", async function () {
			const newAccount = await Account.create({username: user.username + "2", hash, salt})
			const response   = await client.put('/campaign/' + campaign._id, {
				name : campaign.name,
				owner: newAccount.owner,
				_id  : campaign._id
			})
			expect(response.status).to.be.equal(400)
		})
	})

	describe('/blogPosts', function () {

		let blogPost = {
			body : "this is the body",
			owner: loggedInUser._id,
			slug : "This is the slug",
			title: "This is the title"
		}

		let basicFieldAreEquals = function (post) {
			expect(post.body).to.be.equal(blogPost.body)
			expect(post.owner).to.be.equal(blogPost.owner)
			expect(post.slug).to.be.equal(blogPost.slug)
			expect(post.title).to.be.equal(blogPost.title)
		}

		beforeEach(async function () {
			const campaign = await createCampaign()
		})

		describe('post method', function () {
			it("must add a blog post", async function () {
				const response = await client.post(`/campaign/${campaign._id}/blogPosts`, blogPost)
				let campaign   = response.data
				expect(campaign.blogPosts.length).to.be.equal(1)
				let savedBlogPost = campaign.blogPosts[0]
				basicFieldAreEquals(savedBlogPost)
				expect(savedBlogPost._id).to.exist
			})
			it("must return a 404 if the campaign id is not found", function (done) {
				client.post(`/campaign/${loggedInUser._id}/blogPosts`, blogPost)
					.then((response) => {
						// console.log(`/campaign/${loggedInUser._id}/blogPosts`, response);
						expect(response.status).to.be.equal(404)
						done()
					})
					.catch((error) => done(error))
			})
			it("must return a 400 if the campaign id is invalid", function (done) {
				client.post("/campaign/nukemHigh/blogPosts", blogPost)
					.then((response) => {
						// console.log("post /campaign/nukemHigh/blogPosts: ", response);
						expect(response.status).to.be.equal(400)
						done()
					})
					.catch((error) => done(error))
			})
		})
	})
})

