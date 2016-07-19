/**
 * Created by JimBarrows on 7/5/16.
 */
'use strict';
const mongoose = require('mongoose')
		, Account  = require("pinecone-models/src/Account")
		, Channel  = require("pinecone-models/src/Channel")
		, axios    = require("axios")
		, Promise  = require("bluebird")
		, moment   = require("moment");

describe("Channel services", function () {

	let user = {
		username: "ChesterTester@testy.com",
		password: "ChestyTesty"
	};

	beforeEach(function (done) {
		this.axios = axios.create({
			baseURL: 'http://localhost:3000/api',
			timeout: 10000
		});
		Account.remove({})
				.then(() => Channel.remove({}))
				.then(() => this.axios.post('/user/register', user))
				.then((response) => {
					if (!this.axios.defaults.headers) {
						this.axios.defaults.headers = {}
					}
					this.axios.defaults.headers.cookie = response.headers['set-cookie'];
					this.newUser                       = response.data;
					done();
				})
				.catch((error) => console.log("Error setting up channel services: ", error));

	});

	describe("post", function () {

		let channel = {
			name: "new channel"
		};

		let channelWithWordpressDestination = {
			name: "new channel",
			wordPressDestinations: [{
				name: "new word press destination",
				username: "username",
				password: "password",
				url: "http://foo.com/xmlrpc.php"
			}]
		};

		let channelWithFacebookDestination = {
			name: "new channel",
			facebookDestinations: [{
				accessToken: "access token",
				expiresIn: moment(),
				signedRequest: "signed request",
				userId: "user id"
			}]
		};

		it("can create a channel", function (done) {
			this.axios.post(this.newUser.id + '/channels', channel)
					.then((response) => {
						let {_id, name, owner} = response.data;
						expect(name).toBe(channel.name);
						expect(owner).toBe(this.newUser.id);
						expect(_id).toBeDefined();
						done();
					})
					.catch((error) => console.log(error));
		});

		it("can create a channel with a word press destination", function (done) {
			this.axios.post(this.newUser.id + '/channels', channelWithWordpressDestination)
					.then((response) => {
						let {_id, name, owner, wordPressDestinations} = response.data;
						expect(name).toBe(channelWithWordpressDestination.name);
						expect(owner).toBe(this.newUser.id);
						expect(_id).toBeDefined();
						expect(wordPressDestinations).toBeDefined();
						expect(wordPressDestinations.length).toBe(1);
						expect(wordPressDestinations[0].name).toBe(channelWithWordpressDestination.wordPressDestinations[0].name);
						expect(wordPressDestinations[0].username).toBe(channelWithWordpressDestination.wordPressDestinations[0].username);
						expect(wordPressDestinations[0].password).toBe(channelWithWordpressDestination.wordPressDestinations[0].password);
						expect(wordPressDestinations[0].url).toBe(channelWithWordpressDestination.wordPressDestinations[0].url);
						done();
					})
					.catch((error) => console.log(error));
		});

		it("can create a channel with a facebook destination", function (done) {
			this.axios.post(this.newUser.id + '/channels', channelWithFacebookDestination)
					.then((response) => {
						let {_id, name, owner, facebookDestinations} = response.data;
						expect(name).toBe(channelWithFacebookDestination.name);
						expect(owner).toBe(this.newUser.id);
						expect(_id).toBeDefined();
						expect(facebookDestinations).toBeDefined();
						expect(facebookDestinations.length).toBe(1);
						expect(facebookDestinations[0].accessToken).toBe(channelWithFacebookDestination.facebookDestinations[0].accessToken);
						expect(facebookDestinations[0].expiresIn).toBe(channelWithFacebookDestination.facebookDestinations[0].expiresIn.toISOString());
						expect(facebookDestinations[0].signedRequest).toBe(channelWithFacebookDestination.facebookDestinations[0].signedRequest);
						expect(facebookDestinations[0].userId).toBe(channelWithFacebookDestination.facebookDestinations[0].userId);
						done();
					})
					.catch((error) => console.log(error));
		});
	}, 10000);

	describe("get", function () {

		beforeEach(function (done) {
			this.channels = [];
			Channel.create({
						name: "ChannelRow 1",
						owner: this.newUser.id
					})
					.then((channel1) => {
						this.channels.push(channel1);
						return Channel.create({name: "ChannelRow 2", owner: this.newUser.id});
					})
					.then((channel2) => {
						this.channels.push(channel2);
						done();
					})
					.catch((error) => console.log("Couldn't setup from listing channels: ", error));
		});

		function nameOrder(a, b) {
			let nameA = a.name.toUpperCase();
			let nameB = b.name.toUpperCase();
			if (nameA < nameB) {
				return -1;
			} else if (nameA > nameB) {
				return 1;
			} else {
				return 0;
			}
		}

		it("can list channels for the loggged in user", function (done) {
			this.axios.get(this.newUser.id + '/channels')
					.then((response) => {
						let channelList = response.data;
						expect(channelList.length).toBe(this.channels.length);
						this.channels.sort(nameOrder);
						channelList.sort(nameOrder);
						channelList.forEach((channel, index) => {
							expect(channel._id).toBe(this.channels[index]._id.toString());
							expect(channel.name).toBe(this.channels[index].name);
							expect(channel.owner).toBe(this.channels[index].owner.toString());
						});
						done();
					})
					.catch((error) => console.log("error getting list: ", error));
		}, 10000);

		it("can list channels, and their word press destinations for the loggged in user", function (done) {
			Channel.find({owner: this.newUser.id}).exec()
					.then((channelList) => {
						var savePromises = [];
						channelList.forEach((channel) => {
							channel.wordPressDestinations = [{
								name: "dest 1",
								username: "username1",
								password: "password1",
								url: "http://foo.com/xmlrpc.php"
							}];
							savePromises.push(channel.save());
						});
						return Promise.all(savePromises);
					})
					.then(() => {
						return this.axios.get(this.newUser.id + '/channels');
					})
					.then((response) => {
						let channelList = response.data;
						expect(channelList.length).toBe(this.channels.length);
						this.channels.sort(nameOrder);
						channelList.sort(nameOrder);
						channelList.forEach((channel, index) => {
							expect(channel._id).toBe(this.channels[index]._id.toString());
							expect(channel.name).toBe(this.channels[index].name);
							expect(channel.owner).toBe(this.channels[index].owner.toString());
							expect(channel.wordPressDestinations.length).toBe(1);
							channel.wordPressDestinations.forEach((destination)=> {
								expect(destination.name).toBe("dest 1");
								expect(destination.username).toBe("username1");
								expect(destination.password).toBe("password1");
								expect(destination.url).toBe("http://foo.com/xmlrpc.php");
							})
						});
						done();
					})
					.catch((error) => console.log("error getting list: ", error));
		}, 10000);

		it("can list channels, and their facebook destinations for the loggged in user", function (done) {
			const now = moment();
			Channel.find({owner: this.newUser.id}).exec()
					.then((channelList) => {
						var savePromises = [];
						channelList.forEach((channel) => {
							channel.facebookDestinations = [{
								accessToken: "access token",
								expiresIn: now,
								signedRequest: "signed request",
								userId: "user id"
							}];
							savePromises.push(channel.save());
						});
						return Promise.all(savePromises);
					})
					.then(() => {
						return this.axios.get(this.newUser.id + '/channels');
					})
					.then((response) => {
						let channelList = response.data;
						expect(channelList.length).toBe(this.channels.length);
						this.channels.sort(nameOrder);
						channelList.sort(nameOrder);
						channelList.forEach((channel, index) => {
							expect(channel._id).toBe(this.channels[index]._id.toString());
							expect(channel.name).toBe(this.channels[index].name);
							expect(channel.owner).toBe(this.channels[index].owner.toString());
							expect(channel.facebookDestinations.length).toBe(1);
							channel.facebookDestinations.forEach((destination)=> {
								expect(destination.accessToken).toBe("access token");
								expect(destination.expiresIn).toBe(now.toISOString());
								expect(destination.signedRequest).toBe("signed request");
								expect(destination.userId).toBe("user id");
							})

						});
						done();
					})
					.catch((error) => console.log("error getting list: ", error));
		}, 10000);
	});

	describe("put operation", function () {

		beforeEach(function (done) {
			Channel.create({
						name: "ChannelRow 1",
						owner: this.newUser.id
					})
					.then((newChannel) => {
						this.originalChannel = newChannel;
						done();
					})
					.catch((error) => console.log("Couldn't create a test channel for puts: ", error));
		});

		it("should update  a channel", function (done) {
			this.axios.put(this.newUser.id + '/channels/' + this.originalChannel._id, {
						_id: this.originalChannel._id,
						name: "Updated Name"
					})
					.then(()=> Channel.findOne({_id: this.originalChannel._id}))
					.then((updatedChannel) => {
						expect(updatedChannel._id.toString()).toBe(this.originalChannel._id.toString());
						expect(updatedChannel.name).toBe("Updated Name");
						done();
					})
					.catch((error) => console.log("Couldn't update the channel: ", error));
		});

		it("should update a channel with word press destinations", function (done) {
			Channel.find({owner: this.newUser.id}).exec()
					.then((channelList) => {
						var savePromises = [];
						channelList.forEach((channel) => {
							channel.wordPressDestinations = [{
								name: "dest 1",
								username: "username1",
								password: "password1",
								url: "http://foo.com/xmlrpc.php"
							}];
							savePromises.push(channel.save());
						});
						return Promise.all(savePromises);
					})
					.then(() => this.axios.put(this.newUser.id + '/channels/' + this.originalChannel._id, {
						_id: this.originalChannel._id,
						name: "Updated Name",
						wordPressDestinations: [{
							name: "dest 1",
							username: "username1",
							password: "password1",
							url: "http://foo.com/xmlrpc.php"
						}]
					}))
					.then(()=> Channel.findOne({_id: this.originalChannel._id}))
					.then((updatedChannel) => {
						expect(updatedChannel._id.toString()).toBe(this.originalChannel._id.toString());
						expect(updatedChannel.name).toBe("Updated Name");
						expect(updatedChannel.wordPressDestinations.length).toBe(1);
						updatedChannel.wordPressDestinations.forEach((destination)=> {
							expect(destination.name).toBe("dest 1");
							expect(destination.username).toBe("username1");
							expect(destination.password).toBe("password1");
							expect(destination.url).toBe("http://foo.com/xmlrpc.php");
						});
						done();
					})
					.catch((error) => console.log("Couldn't update the channel: ", error));
		});

		it("should update a channel with facebook destinations", function (done) {
			const now = moment();
			Channel.find({owner: this.newUser.id}).exec()
					.then((channelList) => {
						var savePromises = [];
						channelList.forEach((channel) => {
							channel.facebookDestinations = [{
								accessToken: "access token",
								expiresIn: now,
								signedRequest: "signed request",
								userId: "user id"
							}];
							savePromises.push(channel.save());
						});
						return Promise.all(savePromises);
					})
					.then(() => this.axios.put(this.newUser.id + '/channels/' + this.originalChannel._id, {
						_id: this.originalChannel._id,
						name: "Updated Name",
						facebookDestinations: [{
							accessToken: "access token",
							expiresIn: now,
							signedRequest: "signed request",
							userId: "user id"
						}]
					}))
					.then(()=> Channel.findOne({_id: this.originalChannel._id}))
					.then((updatedChannel) => {
						expect(updatedChannel._id.toString()).toBe(this.originalChannel._id.toString());
						expect(updatedChannel.name).toBe("Updated Name");
						expect(updatedChannel.facebookDestinations.length).toBe(1);
						updatedChannel.facebookDestinations.forEach((destination)=> {
							expect(destination.accessToken).toBe("access token");
							expect(moment(destination.expiresIn).toISOString()).toBe(now.toISOString());
							expect(destination.signedRequest).toBe("signed request");
							expect(destination.userId).toBe("user id");
						});
						done();
					})
					.catch((error) => console.log("Couldn't update the channel: ", error));
		});

		it("should update a word press destination of a channel", function (done) {
			Channel.find({owner: this.newUser.id}).exec()
					.then((channelList) => {
						var savePromises = [];
						channelList.forEach((channel) => {
							channel.wordPressDestinations = [{
								name: "dest 1",
								username: "username1",
								password: "password1",
								url: "http://foo.com/xmlrpc.php"
							}];
							savePromises.push(channel.save());
						});
						return Promise.all(savePromises);
					})
					.then(() => this.axios.put(this.newUser.id + '/channels/' + this.originalChannel._id, {
						name: this.originalChannel.name,
						wordPressDestinations: [{
							name: "update dest1",
							username: "username1",
							password: "password1",
							url: "http://foo.com/xmlrpc.php"
						}]
					}))
					.then(()=> Channel.findOne({_id: this.originalChannel._id}))
					.then((updatedChannel) => {
						expect(updatedChannel._id.toString()).toBe(this.originalChannel._id.toString());
						expect(updatedChannel.name).toBe(this.originalChannel.name);
						expect(updatedChannel.wordPressDestinations.length).toBe(1);
						updatedChannel.wordPressDestinations.forEach((destination)=> {
							expect(destination.name).toBe("update dest1");
							expect(destination.username).toBe("username1");
							expect(destination.password).toBe("password1");
							expect(destination.url).toBe("http://foo.com/xmlrpc.php");
						});
						done();
					})
					.catch((error) => console.log("Couldn't update the channel: ", error));
		});
	});

	describe("delete operation", function () {

		beforeEach(function (done) {
			Channel.create({
						name: "ChannelRow 1",
						owner: this.newUser.id
					})
					.then((newChannel) => {
						this.originalChannel = newChannel;
						done();
					})
					.catch((error) => console.log("Couldn't create a test channel for puts: ", error));
		});

		it("should delete a channel", function (done) {
			this.axios.delete(this.newUser.id + '/channels/' + this.originalChannel._id)
					.then(() => Channel.findById(this.originalChannel._id))
					.then((found) => {
						expect(found).toBeNull();
						done();
					})
					.catch((error) => console.log("Couldn't delete a channel: ", error));
		});
	});
});
