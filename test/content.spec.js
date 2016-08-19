/**
 * Created by JimBarrows on 7/6/16.
 */
'use strict';

import axios from "axios";
import chai from "chai";
import {Campaign, Content} from "@reallybigtree/pinecone-models";
import {cleanDatabase, createAccount, login} from "./support/fixtures";

const expect = chai.expect;

describe("/api/content", function () {

	var campaign     = {};
	var client       = {};
	var date         = new Date();
	var loggedInUser = {};

	beforeEach(function (done) {
		client = axios.create({
			baseURL: 'http://localhost:3000/api',
			timeout: 10000
		});
		cleanDatabase()
				.then(()=>createAccount())
				.then(()=>login(client))
				.then((liu)=> {
					loggedInUser = liu;
					done()
				})
				.catch((error) => done(error));

	});

	describe("get method", function () {
		var content = [];
		beforeEach(function (done) {
			Campaign.create({
						name: "Test Campaign"
					})
					.then((newCampaign) => {
						campaign = newCampaign;
						return Content.create({
							body: "body 1",
							campaign: campaign._id,
							createDate: date,
							facebook: {post: "hello world"},
							owner: loggedInUser._id,
							publishDate: date,
							slug: "slug 1",
							title: "title 1",
							transmissionReports: [],
							twitter: null,
							wordPress: {
								excerpt: "excerpt 1",
								status: "publish",
								format: "format"
							}
						});
					})
					.then((newContent) => {
						content.push(newContent);
						done();
					})
					.catch((error) => done(error));
		});

		it("must retrieve a users list of content", function (done) {
			client.get('/content')
					.then((response) => {
						let contentList = response.data;
						console.log("contentList: ", contentList);
						expect(contentList.length).to.be.equal(1);
						expect(contentList[0].body).to.be.equal("body 1");
						expect(contentList[0].createDate).to.be.equal(date.toISOString());
						expect(contentList[0].campaign.toString()).to.be.equal(campaign._id.toString());
						expect(contentList[0].owner).to.be.equal(loggedInUser._id);
						expect(contentList[0].publishDate).to.be.equal(date.toISOString());
						expect(contentList[0].title).to.be.equal("title 1");
						expect(contentList[0].wordPress).to.exist;
						expect(contentList[0].wordPress.excerpt).to.be.equal("excerpt 1");
						expect(contentList[0].wordPress.status).to.be.equal("publish");
						expect(contentList[0].wordPress.format).to.be.equal("format");
						done();
					})
					.catch((error) => done(error));
		});
	});

	describe("post method", function () {

		it("must create content", function (done) {
			client.post('/content', {
						body: "body 1",
						createDate: date,
						campaign: campaign._id,
						owner: loggedInUser._id,
						publishDate: date,
						title: "title 1",
						wordPress: {
							excerpt: "excerpt 1",
							status: "publish",
							format: "format"
						}
					})
					.then((response) => {
								let content = response.data;
						expect(content._id).to.exist;
						expect(content.body).to.be.equal("body 1");
						expect(content.createDate).to.be.equal(date.toISOString());
						expect(content.campaign.toString()).to.be.equal(campaign._id.toString());
						expect(content.owner).to.be.equal(loggedInUser._id);
						expect(content.publishDate).to.be.equal(date.toISOString());
						expect(content.title).to.be.equal("title 1");
						expect(content.wordPress.excerpt).to.be.equal("excerpt 1");
						expect(content.wordPress.status).to.be.equal("publish");
						expect(content.wordPress.format).to.be.equal("format");
								done();
							}
					)
					.catch((error) => done(error));
		});
	});

	describe("put method", function () {

		var content = {};

		beforeEach(function (done) {

			Content.create({
						body: "body 1",
						createDate: date,
						campaign: campaign._id,
						owner: loggedInUser._id,
						publishDate: date,
						title: "title 1",
						wordPress: {
							excerpt: "excerpt 1",
							status: "publish",
							format: "format"
						}
					})
					.then((newContent) => {
						content = newContent;
						done();
					})
					.catch((error) => done(error));
		});

		it("should allow a user to update content", function (done) {
			client.put('/content/' + content._id, {
						body: "body 1 updated",
						createDate: date,
						campaign: campaign._id,
						owner: loggedInUser._id,
						publishDate: date,
						title: "title 1 updated",
						wordPress: {
							excerpt: "excerpt 1 updated",
							status: "publish updated",
							format: "format"
						}
					})
					.then(() => Content.findOne({_id: content._id}))
					.then((content) => {
						expect(content._id.toString()).to.be.equal(content._id.toString());
						expect(content.createDate.toISOString()).to.be.equal(date.toISOString());
						expect(content.campaign.toString()).to.be.equal(campaign._id.toString());
						expect(content.owner.toString()).to.be.equal(loggedInUser._id.toString());
						expect(content.publishDate.toISOString()).to.be.equal(date.toISOString());
						expect(content.title).to.be.equal("title 1 updated");
						expect(content.wordPress.excerpt).to.be.equal("excerpt 1 updated");
						expect(content.wordPress.status).to.be.equal("publish updated");
						expect(content.wordPress.format).to.be.equal("format");
						done();
					})
					.catch((error) => done(error))
		});
	});

	describe("delete method", function () {

		var content = {};

		beforeEach(function (done) {

			Content.create({
						body: "body 1",
						createDate: date,
						campaign: campaign._id,
						owner: loggedInUser._id,
						publishDate: date,
						title: "title 1",
						wordPress: {
							excerpt: "excerpt 1",
							status: "publish",
							format: "format"
						}
					})
					.then((newContent) => {
						content = newContent;
						done();
					})
					.catch((error) => {
						done(error);
					});
		});

		it("allow a user to delete content", function (done) {
			client.delete('/content/' + content._id)
					.then(() => Content.findById(content._id))
					.then((content) => {
						expect(content).to.not.exist;
						done();
					})
					.catch((error) => done(error));
		});
	});
});