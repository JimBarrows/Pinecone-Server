'use strict'

import chai                                                         from "chai"
import {Account}                                                    from "../src/models"
import {cleanDatabase, createAccount, createApiClient, login, user} from "./support/fixtures"

const expect = chai.expect

describe('/api/user', function () {

	var client = {}

	beforeEach(async function () {
		client = createApiClient()
		await cleanDatabase()
		await createAccount()
		await login(client)
	})

	describe("get method", function () {
		it("should return user information when the user is logged in", async function () {
			const response      = await client.get('/user')
			const retrievedUser = response.data
			expect(retrievedUser.username).to.be.equal(user.username)
			expect(retrievedUser.password).to.not.exist
			expect(retrievedUser._id).to.exist
		})
	})
})

describe('/api/user/asset/:assetId', function () {

	let client  = {}
	let account = {}

	beforeEach(async function () {
		client = createApiClient()
		await cleanDatabase()
		account = await createAccount()
		await login(client)

	})

	describe("delete method", function () {

		it("must delete an asset in the accounts document", async function () {
			const asset           = {
				name: "test asset",
				type: "png",
				size: 1000,
				url : "http://localhost"
			}
			const updatedAccount  = await Account.findByIdAndUpdate(account._id, {$push: {assets: asset}}, {new: true})
			const response        = await client.delete('/user/asset/' + updatedAccount.assets[0]._id)
			const modifiedAccount = await Account.findById(account._id)
			let {assets}          = modifiedAccount
			expect(assets.length).to.be.equal(0)
		})
	})

	describe("put method", function () {
		it("must update an asset in the accounts document", async function () {
			const assetOriginal  = {
				name: "test asset",
				type: "png",
				size: 1000,
				url : "http://localhost"
			}
			const updatedAcdount = await Account.findByIdAndUpdate(account._id, {$push: {assets: assetOriginal}}, {new: true})
			const response       = await client.put('/user/asset/' + updatedAcdount.assets[0]._id, {
				_id : updatedAcdount.assets[0]._id,
				name: "test asset updated",
				type: "gif",
				size: 2000,
				url : "http://localhost/updated"
			})
			const accountIndDs   = await Account.findById(account._id)
			expect(accountIndDs.assets.length).to.be.equal(1)
			const asset = accountIndDs.assets[0]
			expect(asset.name).to.be.equal("test asset updated")
			expect(asset.type).to.be.equal("gif")
			expect(asset.size).to.be.equal(2000)
			expect(asset.url).to.be.equal("http://localhost/updated")

		})
	})
})

describe('/api/user/assets', function () {

	let client  = {}
	let account = {}

	beforeEach(async function () {
		client = createApiClient()
		await cleanDatabase()
		account = await createAccount()
		await login(client)
	})

	describe("post method", function () {

		it("should add asset to the currently logged in user account object", async function () {
			let asset = {
				name: "test asset",
				type: "png",
				size: 1000,
				url : "http://localhost"
			}

			const response = await client.post('/user/assets', asset)
			expect(response.status).to.be.equal(200)
			const accountInDs = await Account.findOne({_id: account._id})
			expect(accountInDs.assets.length).to.be.equal(1)
			expect(accountInDs.assets[0].name).to.be.equal(asset.name)
			expect(accountInDs.assets[0].type).to.be.equal(asset.type)
			expect(accountInDs.assets[0].size).to.be.equal(asset.size)
			expect(accountInDs.assets[0].url).to.be.equal(asset.url)
		})
	})
})

describe("/api/user/register", function () {

	let client  = {}
	let account = {}

	beforeEach(async function () {
		client = createApiClient()
		await cleanDatabase()
		// account = await createAccount()
		// await login(client)
	})

	describe("post method", function () {
		it("allows the service client to create a user", async function () {
			let newUserId  = ''
			const response = await client.post('/user/register', user)
			const newUser  = response.data
			expect(newUser.username).to.be.equal(user.username)
			expect(newUser.password).to.not.exist
			expect(newUser._id).to.exist
			newUserId     = newUser._id
			const account = await Account.findOne({username: user.username})
			expect(account).to.exist
			expect(account.username).to.be.equal(user.username)
			expect(account.id).to.be.equal(newUserId)
		})
	})
})

describe("/api/user/login", function () {
	let client  = {}
	let account = {}
	beforeEach(async function () {
		client = createApiClient()
		await cleanDatabase()
		account = await createAccount()
	})
	describe("post method", function () {
		it("Should allow a user login", async function () {
			const response = await client.post('/user/login', user)
			expect(response.status).to.be.equal(200)
			let loggedInUser = response.data
			expect(loggedInUser.username).to.be.equal(user.username)
			expect(loggedInUser._id).to.be.equal(account._id.toString())
			expect(loggedInUser.password).to.not.exist
		})
	})
})
