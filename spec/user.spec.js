'use strict';
const mongoose = require('mongoose')
		, Account  = require("pinecone-models/src/Account")
		, axios    = require("axios");

describe('User functionality', function () {

	var user = {
		username: 'chesty@chester.com'
		, password: 'thisisthepassword'
	};

	const hash = "0933f0cfbd7916d673c9d88ca9b1bd31c41705f7b22bf475bbebc178feb6dab05a87a4d37cade0422c97d28f93daa3e19a1edbff260e063a28bfd39db8fff27a289bbfdde4f9455eec526b05950f190f215bc42d1d1232b70f8a397a652e995aa5743194bf442dc2388fd67ebbd284f5db05e2a49ccf944f060dcc914c4e9f8fd9e135c6b3d274cda05429568baeac0c38938b585ba3ff45506739719d057bd0f2f2a32fa807a6350395f79aee9342603e512d379c27d9e30418d48913be8def133b4a6af3963ac4277d2faca982894f1afb4a35aab43c03bccd5c055dd91ff3699c380e23cf708d064cba6a793cde8f87cd2479cc8ab070001b36274e85bc9b3c6c75697ca41262db5c29a77f08d5ff1bcdc24e40e983999ef69341aaa3fed8d4376bf02f5395f650a02ddc1e16f700522af03b9c2a8115eff32420563c98e7f33d67b4bef159a879920e7939300c676f9295a79492ea38821379a2e90ddb1de66c36f4f56c9504261a834d186efc1cfd65c9918fa565b92e4b56abc97c559786962e1779660980792985d29234d42ebb4fab5f7b41a6f6f1779885234fca68461f21f0772fa1e8da9a23a3f5fe839afe861f8decbe0b456115c5abf010851fe12fa8b6368f61f57ab181ab331f9259b7e9084692d6fa8bf30c660e7057d62f53f1efaeea3f97cf8c5f573c85b538d0f39654760666d6c653b4d5096eedd983";
	const salt = "585f093614aabe59a9e418fa39d29f87069e6e1522ac0170762e4884717032fa";

	beforeAll(function () {
		this.axios = axios.create({
			baseURL: 'http://localhost:3000/api',
			timeout: 1000
		});
	});

	beforeEach(function (done) {
		Account.remove({}, function (err, data) {
			if (err) {
				console.log("Error setting up user functionality test ", err);
			}
			done();
		});

	});

	describe("user registration", function () {

		it("allows the service client to create a user", function (done) {
			let newUserId = '';
			this.axios.post('/user/register', user)
					.then((response) => {
						const newUser = response.data;
						expect(newUser.username).toBe(user.username);
						expect(newUser.password).toBeUndefined();
						expect(newUser._id).toBeDefined();
						newUserId = newUser._id;
						return Account.findOne({username: user.username}).exec();
					})
					.then(function (dbUser) {
						expect(dbUser).toBeDefined();
						expect(dbUser.username).toBe(user.username);
						expect(dbUser.id).toBe(newUserId);
						done();
					})
					.catch((error) => console.log(error));
		});
	});

	describe("user login", function () {
		it("Should allow a user login", function (done) {
			let newUser = {};
			this.axios.post('/user/register', user)
					.then((response) => {
						newUser = response.data;
						return this.axios.post('/user/login', user);
					})
					.then((response) => {
						let loggedInUser = response.data;
						expect(loggedInUser.username).toBe(user.username);
						expect(loggedInUser._id).toBe(newUser._id);
						expect(loggedInUser.password).toBeUndefined();
						done();
					})
					.catch((error) => {
						console.log("Error: ", error);
					});
		});
	});

	describe("returning user information", function () {
		it("should return user information when the user is logged in", function (done) {
			this.axios.post('/user/register', user)
					.then((response) => this.axios.post('/user/login', user))
					.then((response) =>this.axios.get('/user', {headers: {"Cookie": response.headers['set-cookie']}}))
					.then((response) => {
						var retrievedUser = response.data;
						expect(retrievedUser.username).toBe(user.username);
						expect(retrievedUser.password).toBeUndefined();
						expect(retrievedUser._id).toBeDefined();
						done();
					})
					.catch((error) => {
						console.log("Error: ", error);
					});
		});
	});
});