"use strict";
var express           = require('express');
var passport          = require('passport');
var Account           = require('pinecone-models/src/Account');
var router            = express.Router();
const isAuthenticated = require('../authentication');

/* GET users listing. */
router.get('/', function (req, res) {
	res.send('respond with a resource. Foo.');
});

router.put('/facebookId', isAuthenticated, function (req, res) {
	let owner = req.user.id;
	let facebookUserId = req.body.facebookUserId;
	Account.findOneAndUpdate({_id: owner}, {
				facebookUserId
			})
			.exec()
			.then((updatedAccount) => {
				console.log("updated: ", updatedAccount);
				res.status(200).end()
			})
			.catch((error) => {
				console.log("Error updating account ", owner, " with error ", error);
				res.status(400).end();
			});
});

router.post('/register', function (req, res) {
	Account.register(new Account({
		username: req.body.username,
		facebookUserId: ''
	}), req.body.password, function (err, account) {
		if (err) {
			console.log("While registering, could not register user because ", err);
			return res.json({error: err.message});
		}
		passport.authenticate('local')(req, res, function () {
			req.session.save(function (err) {
				if (err) {
					console.log("While registering, could not manually authenticate user because ", err);
					return next(err);
				}
				res.json({id: account._id, username: account.username});
			});
		});
	});
});

router.post('/login', passport.authenticate('local'), function (req, res) {
	res.json({
		username: req.user.username
		, id: req.user._id
		, facebookUserId: req.user.facebookUserId
	})
});

router.get('/logout', function (req, res) {
	req.logout();
	res.status(200).end();
});

module.exports = router;
