/**
 * Created by JimBarrows on 7/8/16.
 */
'use strict';
import promise from "bluebird";
import moment from "moment";
import Account from 'pinecone-models/src/Account';
import Channel from 'pinecone-models/src/Channel';
import Content from 'pinecone-models/src/Content';

Account.remove({})
		.then(() => Content.remove({}))
		.then(() => Channel.remove({}))
		.then(() => {
			let userP    = Account.create({username: 'chestertester', password: 'chestytesty'});
			let channelP = userP.then((user) => Channel.create({
				name: 'word press queue test',
				owner: user._id,
				wordPressDestinations: [{
					name: 'test destination',
					username: 'user',
					password: 'oI8Z4DeWBgXV',
					url: 'http://ec2-52-91-158-90.compute-1.amazonaws.com/xmlrpc.php'
				}]
			}));
			return promise.join(userP, channelP, (user, channel) =>
					Content.create({
								body: 'this is a test body',
								channel: channel._id,
								createDate: moment(),
								owner: user._id,
								publishDate: moment(),
								slug: 'This is a slug',
								title: 'This is a title 2',
								wpFields: {
									excerpt: 'this is a test excerpt',
									status: 'publish',
									format: '',
									type: 'post'
								}
							})
							.then((content) => sendToWordPress(content._id)))
		})
		.catch((error) => console.log("whoops: ", error))
		.finally(() => console.log("done"));
