/**
 * Created by JimBarrows on 8/18/16.
 */
'use strict';

import axios from "axios";
import chai from "chai";
import {Account, Campaign} from "@reallybigtree/pinecone-models";
import {cleanDatabase, createAccount, login, hash, salt, user} from "./support/fixtures";

const expect = chai.expect;

describe("/campaign/:campaignId", function () {

	var client       = {};
	var loggedInUser = {};

	beforeEach(function (done) {
		client = axios.create({
			baseURL: 'http://localhost:3000/api',
			timeout: 10000,
			validateStatus: function (status) {
				return status < 500; // default
			}
		});
		cleanDatabase()
				.then(()=>createAccount())
				.then(()=>login(client))
				.then((liu)=> {
					loggedInUser = liu;
					done()
				})
				.catch((error) => console.log("Error setting up channel services: ", error));

	});

	describe("get method", function () {

		var campaign = {};

		beforeEach(function (done) {
			Campaign.create({
						name: 'Test Campaign 1',
						owner: loggedInUser._id
					})
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
		})
	})
});