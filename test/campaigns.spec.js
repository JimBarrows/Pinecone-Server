/**
 * Created by JimBarrows on 7/5/16.
 */
'use strict';

import axios from "axios";
import chai from "chai";
import {Campaign} from "@reallybigtree/pinecone-models";
import {cleanDatabase, createAccount, login} from "./support/fixtures";

const expect = chai.expect;

describe("/api/campaigns", function () {

	var client       = {};
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
		it("should return a list of campaigns when called", function (done) {
			Campaign.create({
						name: 'Campaign' + 1,
						owner: loggedInUser._id
					})
					.then(() => Campaign.create({
						name: 'Campaign' + 2,
						owner: loggedInUser._id
					}))
					.then(() => client.get('/campaigns'))
					.then((response) => {
						expect(response.data).to.be.an('array');
						expect(response.data.length).to.be.equal(2);
						done();
					})
					.catch((error) => done(error));
		});
	});

	describe("post method", function () {
		it("should create a new campaign", function (done) {
			client.post('/campaigns', {name: 'Campaign1'})
					.then((response) => {
						let newCampaign = response.data;
						expect(newCampaign.name).to.be.equal('Campaign1');
						expect(newCampaign.owner).to.be.equal(loggedInUser._id);
						expect(newCampaign._id).to.exist;
						return Campaign.findById(newCampaign._id);
					})
					.then((mongo) => {
						expect(mongo).to.exist;
						done();
					})
					.catch((error) => done(error));
		});
	});
});

