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

	var user = {
		username: 'chesty@chester.com'
		, password: 'thisisthepassword'
	};

	const hash = "0933f0cfbd7916d673c9d88ca9b1bd31c41705f7b22bf475bbebc178feb6dab05a87a4d37cade0422c97d28f93daa3e19a1edbff260e063a28bfd39db8fff27a289bbfdde4f9455eec526b05950f190f215bc42d1d1232b70f8a397a652e995aa5743194bf442dc2388fd67ebbd284f5db05e2a49ccf944f060dcc914c4e9f8fd9e135c6b3d274cda05429568baeac0c38938b585ba3ff45506739719d057bd0f2f2a32fa807a6350395f79aee9342603e512d379c27d9e30418d48913be8def133b4a6af3963ac4277d2faca982894f1afb4a35aab43c03bccd5c055dd91ff3699c380e23cf708d064cba6a793cde8f87cd2479cc8ab070001b36274e85bc9b3c6c75697ca41262db5c29a77f08d5ff1bcdc24e40e983999ef69341aaa3fed8d4376bf02f5395f650a02ddc1e16f700522af03b9c2a8115eff32420563c98e7f33d67b4bef159a879920e7939300c676f9295a79492ea38821379a2e90ddb1de66c36f4f56c9504261a834d186efc1cfd65c9918fa565b92e4b56abc97c559786962e1779660980792985d29234d42ebb4fab5f7b41a6f6f1779885234fca68461f21f0772fa1e8da9a23a3f5fe839afe861f8decbe0b456115c5abf010851fe12fa8b6368f61f57ab181ab331f9259b7e9084692d6fa8bf30c660e7057d62f53f1efaeea3f97cf8c5f573c85b538d0f39654760666d6c653b4d5096eedd983";
	const salt = "585f093614aabe59a9e418fa39d29f87069e6e1522ac0170762e4884717032fa";

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

		it("can create a channel", function (done) {
			this.axios.post(this.newUser._id + '/channels', channel)
					.then((response) => {
						let {_id, name, owner} = response.data;
						expect(name).toBe(channel.name);
						expect(owner).toBe(this.newUser._id);
						expect(_id).toBeDefined();
						done();
					})
					.catch((error) => console.log("Error post can create a channel", error));
		});

		it("can create a channel with a word press destination", function (done) {
			this.axios.post(this.newUser._id + '/channels', channelWithWordpressDestination)
					.then((response) => {
						let {_id, name, owner, wordPressDestinations} = response.data;
						expect(name).toBe(channelWithWordpressDestination.name);
						expect(owner).toBe(this.newUser._id);
						expect(_id).toBeDefined();
						expect(wordPressDestinations).toBeDefined();
						expect(wordPressDestinations.length).toBe(1);
						expect(wordPressDestinations[0].name).toBe(channelWithWordpressDestination.wordPressDestinations[0].name);
						expect(wordPressDestinations[0].username).toBe(channelWithWordpressDestination.wordPressDestinations[0].username);
						expect(wordPressDestinations[0].password).toBe(channelWithWordpressDestination.wordPressDestinations[0].password);
						expect(wordPressDestinations[0].url).toBe(channelWithWordpressDestination.wordPressDestinations[0].url);
						done();
					})
					.catch((error) => console.log("Error post can create a channel with a word press destination", error));
		});
	});

	describe("get", function () {

		beforeEach(function (done) {
			this.channels = [];
			Channel.create({
						name: "ChannelRow 1",
						owner: this.newUser._id
					})
					.then((channel1) => {
						this.channels.push(channel1);
						return Channel.create({name: "ChannelRow 2", owner: this.newUser._id});
					})
					.then((channel2) => {
						this.channels.push(channel2);
						done();
					})
					.catch((error) => console.log("get before each", error));
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
			this.axios.get(this.newUser._id + '/channels')
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
					.catch((error) => console.log("Error can list channels for the loggged in user: ", error));
		}, 10000);

		it("can list channels, and their word press destinations for the loggged in user", function (done) {
			Channel.find({owner: this.newUser._id}).exec()
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
						return this.axios.get(this.newUser._id + '/channels');
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
					.catch((error) => console.log("Error get can list channels, and their word press destinations for the loggged in user: ", error));
		}, 10000);
	});

	describe("put operation", function () {

		beforeEach(function (done) {
			Channel.create({
						name: "ChannelRow 1",
						owner: this.newUser._id
					})
					.then((newChannel) => {
						this.originalChannel = newChannel;
						done();
					})
					.catch((error) => console.log("Error put operation beforeEach: ", error));
		});

		it("should update a channel", function (done) {
			this.axios.put(this.newUser._id + '/channels/' + this.originalChannel._id, {
						_id: this.originalChannel._id,
						name: "Updated Name"
					})
					.then(()=> Channel.findOne({_id: this.originalChannel._id}))
					.then((updatedChannel) => {
						expect(updatedChannel._id.toString()).toBe(this.originalChannel._id.toString());
						expect(updatedChannel.name).toBe("Updated Name");
						done();
					})
					.catch((error) => console.log("Error put operation should update a channel: ", error));
		});

		it("should update a channel with word press destinations", function (done) {
			Channel.find({owner: this.newUser._id}).exec()
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
					.then(() => this.axios.put(this.newUser._id + '/channels/' + this.originalChannel._id, {
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
					.catch((error) => console.log("Error put operation should update a channel with word press destinations: ", error));
		});


		it("should update a word press destination of a channel", function (done) {
			Channel.find({owner: this.newUser._id}).exec()
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
					.then(() => this.axios.put(this.newUser._id + '/channels/' + this.originalChannel._id, {
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
					.catch((error) => console.log("Error put operation should update a word press destination of a channel: ", error));
		});
	});

	describe("delete operation", function () {

		beforeEach(function (done) {
			Channel.create({
						name: "ChannelRow 1",
						owner: this.newUser._id
					})
					.then((newChannel) => {
						this.originalChannel = newChannel;
						done();
					})
					.catch((error) => console.log("Error delete operation beforeEach : ", error));
		});

		it("should delete a channel", function (done) {
			this.axios.delete(this.newUser._id + '/channels/' + this.originalChannel._id)
					.then(() => Channel.findById(this.originalChannel._id))
					.then((found) => {
						expect(found).toBeNull();
						done();
					})
					.catch((error) => console.log("Error delete operation should delete a channel: ", error));
		});
	});
});
