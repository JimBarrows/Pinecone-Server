/**
 * Created by JimBarrows on 7/6/16.
 */
'use strict';
'use strict';
const mongoose = require('mongoose')
		, Account  = require("../models/account.js")
		, Channel  = require("../models/channel.js")
		, Content  = require("../models/content.js")
		, axios    = require("axios")
		, Promise  = require("bluebird");

describe("Content services", function () {

	let user = {
		username: "ChesterTester@testy.com",
		password: "ChestyTesty"
	};

	beforeEach(function (done) {
		this.axios = axios.create({
			baseURL: 'http://localhost:3000/api',
			timeout: 10000
		});
		this.date  = new Date();
		Account.remove({})
				.then(() => Channel.remove({}))
				.then(() => Content.remove({}))
				.then(() => Channel.create({
					name: "Channel"
				}))
				.then((channel) => {
					this.channel = channel;
					return this.axios.post('/user/register', user)
				})
				.then((response) => {
					if (!this.axios.defaults.headers) {
						this.axios.defaults.headers = {}
					}
					this.axios.defaults.headers.cookie = response.headers['set-cookie'];
					this.user                          = response.data;
					done();
				})
				.catch((error) => console.log("Error setting up content services test: ", error));

	});

	describe("get method", function () {

		beforeEach(function (done) {
			this.content = [];

			Content.create({
						body: "body 1",
						createDate: this.date,
						channel: this.channel._id,
						owner: this.user.id,
						publishDate: this.date,
						title: "title 1",
						wpFields: {
							excerpt: "excerpt 1",
							status: "publish",
							format: "format"
						}
					})
					.then((content) => {
						this.content.push(content);

						done();
					});
		});

		it("must retrieve a users list of content", function (done) {
			this.axios.get('/content')
					.then((response) => {
						let contentList = response.data;
						expect(contentList.length).toBe(1);
						expect(contentList[0].body).toBe("body 1");
						expect(contentList[0].createDate).toBe(this.date.toISOString());
						expect(contentList[0].channel.toString()).toBe(this.channel._id.toString());
						expect(contentList[0].owner).toBe(this.user.id);
						expect(contentList[0].publishDate).toBe(this.date.toISOString());
						expect(contentList[0].title).toBe("title 1");
						expect(contentList[0].wpFields.excerpt).toBe("excerpt 1");
						expect(contentList[0].wpFields.status).toBe("publish");
						expect(contentList[0].wpFields.format).toBe("format");
						done();
					})
					.catch((error) => console.log("Error getting list: ", error));
		}, 10000);
	});

	describe("post method", function () {

		it("should allow a user to create content", function (done) {
			this.axios.post('/content', {
						body: "body 1",
						createDate: this.date,
						channel: this.channel._id,
						owner: this.user.id,
						publishDate: this.date,
						title: "title 1",
						wpFields: {
							excerpt: "excerpt 1",
							status: "publish",
							format: "format"
						}
					})
					.then((response) => {
								let content = response.data;
								expect(content._id).toBeDefined();
								expect(content.body).toBe("body 1");
								expect(content.createDate).toBe(this.date.toISOString());
								expect(content.channel.toString()).toBe(this.channel._id.toString());
								expect(content.owner).toBe(this.user.id);
								expect(content.publishDate).toBe(this.date.toISOString());
								expect(content.title).toBe("title 1");
						expect(content.wpFields.excerpt).toBe("excerpt 1");
						expect(content.wpFields.status).toBe("publish");
						expect(content.wpFields.format).toBe("format");
								done();
							}
					)
					.catch((error) => console.log("Couldn't post new content. ", error));
		}, 10000);
	});

	describe("put method", function () {

		beforeEach(function (done) {

			Content.create({
						body: "body 1",
						createDate: this.date,
						channel: this.channel._id,
						owner: this.user.id,
						publishDate: this.date,
						title: "title 1",
						wpFields: {
							excerpt: "excerpt 1",
							status: "publish",
							format: "format"
						}
					})
					.then((content) => {
						this.content = content;
						done();
					});
		});

		it("should allow a user to update content", function (done) {
			this.axios.put('/content/' + this.content._id, {
						body: "body 1 updated",
						createDate: this.date,
						channel: this.channel._id,
						owner: this.user.id,
						publishDate: this.date,
						title: "title 1 updated",
						wpFields: {
							excerpt: "excerpt 1 updated",
							status: "publish updated",
							format: "format"
						}
					})
					.then(() => Content.findOne({_id: this.content._id}))
					.then((content) => {
						expect(content._id.toString()).toBe(this.content._id.toString());
						expect(content.createDate.toISOString()).toBe(this.date.toISOString());
						expect(content.channel.toString()).toBe(this.channel._id.toString());
						expect(content.owner.toString()).toBe(this.user.id.toString());
						expect(content.publishDate.toISOString()).toBe(this.date.toISOString());
						expect(content.title).toBe("title 1 updated");
						expect(content.wpFields.excerpt).toBe("excerpt 1 updated");
						expect(content.wpFields.status).toBe("publish updated");
						expect(content.wpFields.format).toBe("format");
						done();
					})
					.catch((error) => console.log("Couldn't update the content because ", error));
		}, 10000);
	});

	describe("delete method", function () {

		beforeEach(function (done) {

			Content.create({
						body: "body 1",
						createDate: this.date,
						channel: this.channel._id,
						owner: this.user.id,
						publishDate: this.date,
						title: "title 1",
						wpFields: {
							excerpt: "excerpt 1",
							status: "publish",
							format: "format"
						}
					})
					.then((content) => {
						this.content = content;
						done();
					});
		});

		it("allow a user to delete content", function (done) {
			this.axios.delete('/content/' + this.content._id)
					.then(() => Content.findById(this.content._id))
					.then((content) => {
						expect(content).toBeNull();
						done();
					})
					.catch((error) => console.log("Couldn't delete the content because ", error));
		})
	})
});