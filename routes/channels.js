const express         = require('express'),
      router          = express.Router(),
      isAuthenticated = require('../authentication');
import Channel from "pinecone-models/src/Channel";


/* GET home page. */
router.post('/', isAuthenticated, function (req, res) {
	console.log("post channel: ", req.body);
	let {name, wordPressDestinations, facebookDestinations} = req.body;
	let owner = req.user.id;
	Channel.create({
				name,
				owner,
				wordPressDestinations,
				facebookDestinations
			})
			.then((newChannel) => {
				res.status(201).json(newChannel).end()
			})
			.catch((error) => {
				console.log("Error creating channel", name, " for ", req.user.username, ".  ", error);
				res.status(400).end();
			});
});

router.get('/', isAuthenticated, function (req, res) {
	Channel.find({owner: req.user.id}).exec()
			.then((channelList) => res.status(200).json(channelList).end())
			.catch((error) => {
				console.log("Error retrieving channel list for ", req.user.username, ".  ", error);
				res.status(400).end()
			});
});

router.put('/:channelId', isAuthenticated, function (req, res) {
	let {name, wordPressDestinations, facebookDestinations} = req.body;
	let {channelId} = req.params;

	Channel.findOneAndUpdate({_id: channelId}, {
				name,
				wordPressDestinations,
				facebookDestinations
			})
			.exec()
			.then((updatedChannel) => res.status(200).end())
			.catch((error) => {
				console.log("Error updating channel ", channelId, " with error ", error);
				res.status(400).end();
			});
});

router.delete('/:channelId', isAuthenticated, function (req, res) {
	let {channelId} = req.params;
	Channel.remove({_id: channelId})
			.then(() => res.status(200).end())
			.catch((error) => {
				console.log("Error deleting channel ", channelId, " error: ", error);
				res.status(400).end();
			});
});

router.get('/ping', function (req, res) {
	res.status(200).send("pong!");
});


module.exports = router;
