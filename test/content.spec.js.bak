/**
 * Created by JimBarrows on 7/6/16.
 */
'use strict';
import {Account, Campaign} from "@reallybigtree/pinecone-models";
import axios from "axios";
import {cleanDatabase, createAccount, login} from "./support/fixtures";

describe("Content services", function () {

	beforeEach(function (done) {
		this.axios = axios.create({
			baseURL: 'http://localhost:3000/api',
			timeout: 10000
		});
		this.date  = new Date();
		cleanDatabase()
				.then(()=> createAccount())
				.then(()=> login())
				.then(()=>done())
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