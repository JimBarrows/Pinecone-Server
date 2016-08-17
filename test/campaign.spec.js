/**
 * Created by JimBarrows on 7/5/16.
 */
'use strict';

import {Campaign} from "@reallybigtree/pinecone-models";
import axios from "axios";
import {cleanDatabase, createAccount, login} from "./support/fixtures";

describe("/api/campaigns", function () {


	beforeEach(function (done) {
		this.axios = axios.create({
			baseURL: 'http://localhost:3000/api',
			timeout: 10000
		});
		cleanDatabase()
				.then(()=>createAccount())
				.then(()=>login(axios))
				.then((loggedInUser)=> {
					this.loggedInUser = loggedInUser;
					done()
				})
				.catch((error) => console.log("Error setting up channel services: ", error));

	});

	describe("get method", function (done) {
		it("should return a list of campaigns when called", () => {
			this.axios.get('/campaigns')
					.then((response) => {
						console.log(response.data);
						done()
					})
					.catch((error) => console.log(error));
		})
	});
	describe("post method", function (done) {

	});
});

