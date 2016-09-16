/**
 * Created by JimBarrows on 8/18/16.
 */
'use strict';

import chai from "chai";
import {Account, Campaign} from "@reallybigtree/pinecone-models";
import {cleanDatabase, createAccount, createApiClient, login, hash, salt, user} from "./support/fixtures";

const expect = chai.expect;

describe("/campaign/:campaignId", function () {

	var campaign       = {};
	var client         = {};
	var loggedInUser   = {};
	var createCampaign = function () {
		return Campaign.create({
			name: 'Test Campaign 1',
			owner: loggedInUser._id
		});
	};

	beforeEach(function (done) {
		client = createApiClient();
		cleanDatabase()
				.then(()=>createAccount())
				.then(()=>login(client))
				.then((liu)=> {
					loggedInUser = liu;
					done()
				})
				.catch((error) => done(error));

	});

	describe("delete method", function () {

		beforeEach(function (done) {
			createCampaign()
					.then(function (newCampaign) {
						campaign = newCampaign;
						done();
					})
					.catch(function (error) {
						console.log("delete /api/campaign/:campaignId beforeAll error: ", error);
						done(error);
					})
		});

		it("must delete the campaign from the database", (done)=> {
			client.delete('/campaign/' + campaign._id)
					.then((response)=>Campaign.findById(campaign._id))
					.then((campaign)=>expect(campaign).to.be.null)
					.then(()=> done())
					.catch((error) => done(error))
		})
	});

	describe("get method", function () {

		beforeEach(function (done) {
			createCampaign()
					.then(function (newCampaign) {
						campaign = newCampaign;
						done();
					})
					.catch(function (error) {
						console.log("/api/campaign/:campaignId get method beforeAll error: ", error);
						done(error);
					})
		});

		it("must retrieve the campaign specified by the id", function (done) {
			client.get('/campaign/' + campaign._id)
					.then((response) => {
						expect(response.data).to.exist;
						expect(response.data.name).to.be.equal(campaign.name);
						done();
					})
					.catch((error) => done(error));
		});

		it("must 404 if the campaign is not owned by the logged in user", function (done) {
			Account.create({username: user.username + "2", hash, salt})
					.then((newAccount) => Campaign.create({
						name: 'Test Campaign 2',
						owner: newAccount._id
					}))
					.then((unownedCampaign) => client.get('/campaign/' + unownedCampaign._id))
					.then((response) => {
						expect(response.status).to.be.equal(404);
						done();
					})
					.catch((error) => {
						done(error);
					});
		});
	});

	describe('put method', function () {

		beforeEach(function (done) {
			createCampaign()
					.then(function (newCampaign) {
						campaign = newCampaign;
						done();
					})
					.catch(function (error) {
						console.log("put /api/campaign/:campaignId beforeAll error: ", error);
						done(error);
					})
		});

		it("must update the campaign", function (done) {
			let updatedCampaign = {
				name: 'Test Campaign 1 updated',
				owner: loggedInUser._id,
				_id: campaign._id
			};
			client.put('/campaign/' + campaign._id, updatedCampaign)
					.then((response) => {
						expect(response.status).to.be.equal(200);
						Campaign.findById(campaign._id)
								.then((found) => expect(found.name).to.be.equal(updatedCampaign.name))
								.catch((error) => done(error));
						done();
					})
					.catch((error) => done(error));
		});

		it("must return a status of 400 if the campaign being updated is not owned by the logged in user.", function (done) {
			Account.create({username: user.username + "2", hash, salt})
					.then((newAccount) => Campaign.create({name: 'Test Campaign 2', owner: newAccount._id}))
					.then((unownedCampaign) => client.put('/campaign/' + unownedCampaign._id, {
						name: 'Test Campaign 2 updated',
						owner: unownedCampaign.owner,
						_id: unownedCampaign._id
					}))
					.then((response) => {
						expect(response.status).to.be.equal(400);
						done();
					})
					.catch((error) => {
						console.log("error: ", error);
						done(error);
					});
		});

		it("must not override the owner.", function (done) {
			Account.create({username: user.username + "2", hash, salt})
					.then((newAccount) => client.put('/campaign/' + campaign._id, {
						name: campaign.name,
						owner: newAccount.owner,
						_id: campaign._id
					}))
					.then((response) => {
						expect(response.status).to.be.equal(400);
						done();
					})
					.catch((error) => done(error));
		})
	});

	describe('/blogPosts', function () {

		var blogPost = {
			body: "this is the body",
			owner: loggedInUser._id,
			slug: "This is the slug",
			title: "This is the title"
		};

		var basicFieldAreEquals = function (post) {
			expect(post.body).to.be.equal(blogPost.body);
			expect(post.owner).to.be.equal(blogPost.owner);
			expect(post.slug).to.be.equal(blogPost.slug);
			expect(post.title).to.be.equal(blogPost.title);
		};

		beforeEach(function (done) {
			createCampaign()
					.then(function (newCampaign) {
						campaign = newCampaign;
						done();
					})
					.catch(function (error) {
						done(error);
					})
		});

		describe('post method', function () {
			it("must add a blog post", function (done) {
				client.post(`/campaign/${campaign._id}/blogPosts`, blogPost)
						.then((response) => {
							let campaign = response.data;
							expect(campaign.blogPosts.length).to.be.equal(1);
							let savedBlogPost = campaign.blogPosts[0];
							basicFieldAreEquals(savedBlogPost);
							expect(savedBlogPost._id).to.exist;
							done();
						})
						.catch((error) => done(error));
			});
			it("must return a 404 if the campaign id is not found", function (done) {
				client.post(`/campaign/${loggedInUser._id}/blogPosts`, blogPost)
						.then((response) => {
							// console.log(`/campaign/${loggedInUser._id}/blogPosts`, response);
							expect(response.status).to.be.equal(404);
							done();
						})
						.catch((error) => done(error));
			});
			it("must return a 400 if the campaign id is invalid", function (done) {
				client.post("/campaign/nukemHigh/blogPosts", blogPost)
						.then((response) => {
							// console.log("post /campaign/nukemHigh/blogPosts: ", response);
							expect(response.status).to.be.equal(400);
							done();
						})
						.catch((error) => done(error));
			})
		});
	});
});

