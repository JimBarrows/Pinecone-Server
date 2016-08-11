/**
 * Created by JimBarrows on 8/10/16.
 */
'use strict';

export  default {
	development: {
		mongoose: {
			url: 'mongodb://localhost/pinecone'
		},
		rabbitMq: {
			url: 'amqp://localhost'
		}
	},
	production: {
		mongoose: {
			url: 'mongodb://mongo/pinecone'
		},
		rabbitMq: {
			url: 'amqp://rabbitmq'
		}
	}
}