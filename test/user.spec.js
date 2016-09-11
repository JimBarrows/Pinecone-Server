'use strict';

import chai from "chai";
import {Account} from "@reallybigtree/pinecone-models";
import {cleanDatabase, createAccount, createApiClient, login, user} from "./support/fixtures";

const expect = chai.expect;

describe('/api/user', function () {

	var client = {};

	beforeEach(function (done) {
		client = createApiClient();
		cleanDatabase()
				.then(()=>createAccount())
				.then(()=>login(client))
				.then(()=> done())
				.catch((error) => done(error));

	});

	describe("get method", function () {
		it("should return user information when the user is logged in", function (done) {
			client.get('/user')
					.then((response) => {
						var retrievedUser = response.data;
						expect(retrievedUser.username).to.be.equal(user.username);
						expect(retrievedUser.password).to.not.exist;
						expect(retrievedUser._id).to.exist;
						done();
					})
					.catch((error) => {
						done(error)
					});
		});
	});
});

describe('/api/user/asset/:assetId', function () {

	var client = {};
	var id     = null;

	beforeEach(function (done) {
		client = createApiClient();
		cleanDatabase()
				.then(()=>createAccount())
				.then((account)=> id = account._id)
				.then(()=>login(client))
				.then(()=> done())
				.catch((error) => done(error));

	});

	describe("delete method", function () {

		it("must delete an asset in the accounts document", function (done) {
			let asset = {
				name: "test asset",
				type: "png",
				size: 1000,
				url: "http://localhost"
			};
			Account.findByIdAndUpdate(id, {$push: {assets: asset}}, {new: true})
					.then((updatedAccount) => client.delete('/user/asset/' + updatedAccount.assets[0]._id))
					.then(() => Account.findById(id))
					.then((account) => {
						let {assets} = account;
						expect(assets.length).to.be.equal(0);
					})
					.then(()=> done())
					.catch((error)=> {
						console.log("error: ", error);
						done(new Error(error))
					});
		})
	});

	describe("put method", function () {
		it("must update an asset in the accounts document", function (done) {
			let asset = {
				name: "test asset",
				type: "png",
				size: 1000,
				url: "http://localhost"
			};
			Account.findByIdAndUpdate(id, {$push: {assets: asset}}, {new: true})
					.then((updatedAccount) => client.put('/user/asset/' + updatedAccount.assets[0]._id, {
						_id: updatedAccount.assets[0]._id,
						name: "test asset updated",
						type: "gif",
						size: 2000,
						url: "http://localhost/updated"
					}))
					.then(() => Account.findById(id))
					.then((account)=> {
						expect(account.assets.length).to.be.equal(1);
						const asset = account.assets[0];
						expect(asset.name).to.be.equal("test asset updated");
						expect(asset.type).to.be.equal("gif");
						expect(asset.size).to.be.equal(2000);
						expect(asset.url).to.be.equal("http://localhost/updated");
					})
					.then(()=> done())
					.catch((error)=> {
						console.log("error: ", error);
						done(new Error(error))
					});
		});
	});
});

describe('/api/user/assets', function () {

	var client = {};
	var id     = null;

	beforeEach(function (done) {
		client = createApiClient();
		cleanDatabase()
				.then(()=>createAccount())
				.then((account)=> id = account._id)
				.then(()=>login(client))
				.then(()=> done())
				.catch((error) => done(error));

	});

	describe("post method", function () {

		it("should add asset to the currently logged in user account object", function (done) {
			let asset = {
				name: "test asset",
				type: "png",
				size: 1000,
				url: "http://localhost"
			};

			client.post('/user/assets', asset)
					.then(()=>Account.findOne({_id: id}))
					.then((account)=> {
						expect(account.assets.length).to.be.equal(1);
						expect(account.assets[0].name).to.be.equal(asset.name);
						expect(account.assets[0].type).to.be.equal(asset.type);
						expect(account.assets[0].size).to.be.equal(asset.size);
						expect(account.assets[0].url).to.be.equal(asset.url);
						done();
					})
					.catch((error)=> {
						done(new Error("Error: " + error.status));
					});
		});
	})
});

describe("/api/user/register", function () {
	var client = {};

	beforeEach(function (done) {
		client = createApiClient();
		cleanDatabase()
				.then(()=> done())
				.catch((error) => done(error));

	});
	describe("post method", function () {
		it("allows the service client to create a user", function (done) {
			let newUserId = '';
			client.post('/user/register', user)
					.then((response) => {
						const newUser = response.data;
						expect(newUser.username).to.be.equal(user.username);
						expect(newUser.password).to.not.exist;
						expect(newUser._id).to.exist;
						newUserId = newUser._id;
						return Account.findOne({username: user.username}).exec();
					})
					.then(function (dbUser) {
						expect(dbUser).to.exist;
						expect(dbUser.username).to.be.equal(user.username);
						expect(dbUser.id).to.be.equal(newUserId);
						done();
					})
					.catch((error) => done(error));
		});
	});
});

describe("/api/user/login", function () {
	var client = {};
	var id     = null;

	beforeEach(function (done) {
		client = createApiClient();
		cleanDatabase()
				.then(()=>createAccount())
				.then((account) => id = account._id)
				.then(()=> done())
				.catch((error) => done(error));

	});
	describe("post method", function () {
		it("Should allow a user login", function (done) {
			client.post('/user/login', user)
					.then((response) => {
						let loggedInUser = response.data;
						expect(loggedInUser.username).to.be.equal(user.username);
						expect(loggedInUser._id).to.be.equal(id.toString());
						expect(loggedInUser.password).to.not.exist;
						done();
					})
					.catch((error) => {
						done(error);
					});
		});
	});
});