/**
 * Created by JimBarrows on 7/6/16.
 */
'use strict';
'use strict';
const mongoose = require('mongoose')
		, Account  = require("@reallybigtree/pinecone-models/src/Account")
		, Channel  = require("@reallybigtree/pinecone-models/src/Channel")
		, Content  = require("@reallybigtree/pinecone-models/src/Content.js")
		, axios    = require("axios")
		, Promise  = require("bluebird");

describe("Content services", function () {

	const username = 'chesty@chester.com';
	const password = 'thisisthepassword';


	const hash = "0933f0cfbd7916d673c9d88ca9b1bd31c41705f7b22bf475bbebc178feb6dab05a87a4d37cade0422c97d28f93daa3e19a1edbff260e063a28bfd39db8fff27a289bbfdde4f9455eec526b05950f190f215bc42d1d1232b70f8a397a652e995aa5743194bf442dc2388fd67ebbd284f5db05e2a49ccf944f060dcc914c4e9f8fd9e135c6b3d274cda05429568baeac0c38938b585ba3ff45506739719d057bd0f2f2a32fa807a6350395f79aee9342603e512d379c27d9e30418d48913be8def133b4a6af3963ac4277d2faca982894f1afb4a35aab43c03bccd5c055dd91ff3699c380e23cf708d064cba6a793cde8f87cd2479cc8ab070001b36274e85bc9b3c6c75697ca41262db5c29a77f08d5ff1bcdc24e40e983999ef69341aaa3fed8d4376bf02f5395f650a02ddc1e16f700522af03b9c2a8115eff32420563c98e7f33d67b4bef159a879920e7939300c676f9295a79492ea38821379a2e90ddb1de66c36f4f56c9504261a834d186efc1cfd65c9918fa565b92e4b56abc97c559786962e1779660980792985d29234d42ebb4fab5f7b41a6f6f1779885234fca68461f21f0772fa1e8da9a23a3f5fe839afe861f8decbe0b456115c5abf010851fe12fa8b6368f61f57ab181ab331f9259b7e9084692d6fa8bf30c660e7057d62f53f1efaeea3f97cf8c5f573c85b538d0f39654760666d6c653b4d5096eedd983";
	const salt = "585f093614aabe59a9e418fa39d29f87069e6e1522ac0170762e4884717032fa";

	beforeEach(function (done) {
		this.axios = axios.create({
			baseURL: 'http://localhost:3000/api',
			timeout: 10000
		});
		this.date  = new Date();
		Account.remove({})
				.then(() => Channel.remove({}))
				.then(() => Content.remove({}))
				.then(() => Account.create({username, hash, salt}))
				.then(() => Channel.create({name: "Channel"}))
				.then((channel) => this.channel = channel)
				.then(() => this.axios.post('/user/login', {username, password}))
				.then((response) => {
					if (!this.axios.defaults.headers) {
						this.axios.defaults.headers = {}
					}
					this.axios.defaults.headers.cookie = response.headers['set-cookie'];
					this.user                          = response.data;
					done();
				})
				.catch((error) => console.log("Error Content services beforeEach: ", error));

	});

	describe("get method", function () {

		beforeEach(function (done) {
			this.content = [];

			Content.create({
						body: "body 1",
						channel: this.channel._id,
						createDate: this.date,
						facebook: {post: "hello world"},
						owner: this.user._id,
						publishDate: this.date,
						slug: "slug 1",
						title: "title 1",
						transmissionReports: [],
						twitter: null,
						wordPress: {
							excerpt: "excerpt 1",
							status: "publish",
							format: "format"
						}
					})
					.then((content) => {
						this.content.push(content);
						done();
					})
					.catch((error) => {
						console.log("Error contentServices get method beforeEach: ", error);
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
						expect(contentList[0].owner).toBe(this.user._id);
						expect(contentList[0].publishDate).toBe(this.date.toISOString());
						expect(contentList[0].title).toBe("title 1");
						expect(contentList[0].wordPress).toBeDefined();
						expect(contentList[0].wordPress.excerpt).toBe("excerpt 1");
						expect(contentList[0].wordPress.status).toBe("publish");
						expect(contentList[0].wordPress.format).toBe("format");
						done();
					})
					.catch((error) => console.log("Error content services get method must retrieve a users list of content: ", error));
		}, 10000);
	});

	describe("post method", function () {

		it("should allow a user to create content", function (done) {
			this.axios.post('/content', {
						body: "body 1",
						createDate: this.date,
						channel: this.channel._id,
						owner: this.user._id,
						publishDate: this.date,
						title: "title 1",
						wordPress: {
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
						expect(content.owner).toBe(this.user._id);
								expect(content.publishDate).toBe(this.date.toISOString());
								expect(content.title).toBe("title 1");
						expect(content.wordPress.excerpt).toBe("excerpt 1");
						expect(content.wordPress.status).toBe("publish");
						expect(content.wordPress.format).toBe("format");
								done();
							}
					)
					.catch((error) => console.log("Error content services post method should allow a user to create content", error));
		}, 10000);
	});

	describe("put method", function () {

		beforeEach(function (done) {

			Content.create({
						body: "body 1",
						createDate: this.date,
						channel: this.channel._id,
						owner: this.user._id,
						publishDate: this.date,
						title: "title 1",
						wordPress: {
							excerpt: "excerpt 1",
							status: "publish",
							format: "format"
						}
					})
					.then((content) => {
						this.content = content;
						done();
					})
					.catch((error) => {
						console.log("Error content services put method beforeEach: ", error);
					});
		});

		it("should allow a user to update content", function (done) {
			this.axios.put('/content/' + this.content._id, {
						body: "body 1 updated",
						createDate: this.date,
						channel: this.channel._id,
						owner: this.user._id,
						publishDate: this.date,
						title: "title 1 updated",
						wordPress: {
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
						expect(content.owner.toString()).toBe(this.user._id.toString());
						expect(content.publishDate.toISOString()).toBe(this.date.toISOString());
						expect(content.title).toBe("title 1 updated");
						expect(content.wordPress.excerpt).toBe("excerpt 1 updated");
						expect(content.wordPress.status).toBe("publish updated");
						expect(content.wordPress.format).toBe("format");
						done();
					})
					.catch((error) => console.log("Error content services put method should allow a user to update content", error));
		}, 10000);
	});

	describe("delete method", function () {

		beforeEach(function (done) {

			Content.create({
						body: "body 1",
						createDate: this.date,
						channel: this.channel._id,
						owner: this.user._id,
						publishDate: this.date,
						title: "title 1",
						wordPress: {
							excerpt: "excerpt 1",
							status: "publish",
							format: "format"
						}
					})
					.then((content) => {
						this.content = content;
						done();
					})
					.catch((error) => {
						console.log("Error content services delete method beforeEach: ", error);
					});
		});

		it("allow a user to delete content", function (done) {
			this.axios.delete('/content/' + this.content._id)
					.then(() => Content.findById(this.content._id))
					.then((content) => {
						expect(content).toBeNull();
						done();
					})
					.catch((error) => console.log("Error content services delete method allow a user to delete content", error));
		})
	})
});