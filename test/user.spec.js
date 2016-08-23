'use strict';

import axios from "axios";
import chai from "chai";
import {Account} from "@reallybigtree/pinecone-models";
import {cleanDatabase, createAccount, login, user} from "./support/fixtures";

const expect = chai.expect;

describe('/api/user', function () {

	var client = {};

	beforeEach(function (done) {
		client = axios.create({
			baseURL: 'http://localhost:3000/api',
			timeout: 10000
		});
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

describe('/api/user/assets', function () {

	var client = {};
	var id     = null;

	beforeEach(function (done) {
		client = axios.create({
			baseURL: 'http://localhost:3000/api',
			timeout: 10000
		});
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
		client = axios.create({
			baseURL: 'http://localhost:3000/api',
			timeout: 10000
		});
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
		client = axios.create({
			baseURL: 'http://localhost:3000/api',
			timeout: 10000
		});
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