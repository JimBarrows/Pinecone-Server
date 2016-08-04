/**
 * Created by JimBarrows on 7/7/16.
 */
'use strict';
import amqp from "amqplib";
import promise from "bluebird";

/*
 TODO: `sentToQueue` and `publish` both return a boolean indicating whether it's OK to send again straight away, or (when `false`) that you should wait for the event `'drain'` to fire before writing again. We're just doing the one write, so we'll ignore it.
 */
export function toWordPress(contentId) {
	const queueName  = 'wordperfect';
	const connection = amqp.connect('amqp://rabbitmq');
	const channel    = connection.then((conn) =>conn.createChannel());
	return promise.join(connection, channel, (con, ch) =>
			ch.assertQueue(queueName, {durable: true})
					.then((qok) => ch.sendToQueue(queueName, new Buffer(contentId.toString())))
					.finally(() => ch.close()
							.finally(()=> con.close())));
}

export function toFacebook(contentId) {
	const queueName  = "facebook";
	const connection = amqp.connect('amqp://rabbitmq');
	const channel    = connection.then((conn) =>conn.createChannel());
	return promise.join(connection, channel, (con, ch) =>
			ch.assertQueue(queueName, {durable: true})
					.then((qok) => ch.sendToQueue(queueName, new Buffer(contentId.toString())))
					.finally(() => ch.close()
							.finally(()=> con.close())));
}

export function toTwitter(contentId) {
	const queueName  = "twitter";
	const connection = amqp.connect('amqp://rabbitmq');
	const channel    = connection.then((conn) =>conn.createChannel());
	return promise.join(connection, channel, (con, ch) =>
			ch.assertQueue(queueName, {durable: true})
					.then((qok) => ch.sendToQueue(queueName, new Buffer(contentId.toString())))
					.finally(() => ch.close()
							.finally(()=> con.close())));
}
