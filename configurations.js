/**
 * Created by JimBarrows on 8/10/16.
 */
"use strict";

export  default {
	development: {
		mongoose: {
			url: "mongodb://localhost/pinecone"
		},
		rabbitMq: {
			url: "amqp://localhost"
		},
		twitter: {
			publicKey: "CEmmg8lwj4OQsTEw9orBF7VAc",
			secretKey: "YrKdLxTB74VPrg1o4wsaK8moPEKG4bNmK6vawvlAgmSUoVuGBY",
			requestTokenUrl: "https://api.twitter.com/oauth/request_token",
			requestTokenUrlMethod: "POST",
			finishUrl: "http://127.0.0.1:8080/api/user/twitterAccount/finish/"
		},
		settings: {
			url: "/#/settings"
		}
	},
	production: {
		mongoose: {
			url: "mongodb://mongo/pinecone"
		},
		rabbitMq: {
			url: "amqp://rabbitmq"
		},
		twitter: {
			publicKey: "CEmmg8lwj4OQsTEw9orBF7VAc",
			secretKey: "YrKdLxTB74VPrg1o4wsaK8moPEKG4bNmK6vawvlAgmSUoVuGBY",
			requestTokenUrl: "https://api.twitter.com/oauth/request_token",
			requestTokenUrlMethod: "POST",
			finishUrl: "http://127.0.0.1:8080/api/user/twitterAccount/finish/"
		}
	}
}