/**
 * Created by JimBarrows on 8/10/16.
 */
"use strict";

export  default {
	development: {
		facebook: {
			clientId: "1236802509686356",
			clientSecret: "80fd99d15c54490d6558e3883c1bc40f",
			finishUrl: "http://127.0.0.1:8080/api/user/facebookAccount/finish/",
			grantType: "fb_exchange_token",
			requestTokenUrl: "https://graph.facebook.com/oauth/access_token",
			requestTokenUrlMethod: "POST"

		},
		mongoose: {
			url: "mongodb://localhost/pinecone"
		},
		rabbitMq: {
			url: "amqp://localhost"
		},

		settings: {
			url: "/#/settings"
		},
		twitter: {
			publicKey: "CEmmg8lwj4OQsTEw9orBF7VAc",
			secretKey: "YrKdLxTB74VPrg1o4wsaK8moPEKG4bNmK6vawvlAgmSUoVuGBY",
			requestTokenUrl: "https://api.twitter.com/oauth/request_token",
			requestTokenUrlMethod: "POST",
			finishUrl: "http://127.0.0.1:8080/api/user/twitterAccount/finish/"
		}
	},
	production: {
		facebook: {
			clientId: "1236802509686356",
			clientSecret: "80fd99d15c54490d6558e3883c1bc40f",
			finishUrl: "http://127.0.0.1:8080/api/user/facebookAccount/finish/",
			grantType: "fb_exchange_token",
			requestTokenUrl: "https://graph.facebook.com/oauth/access_token",
			requestTokenUrlMethod: "POST"

		},
		mongoose: {
			url: "mongodb://mongo/pinecone"
		},
		rabbitMq: {
			url: "amqp://rabbitmq"
		},
		redis: {
			host: "redis",
			port: 6379,
			ttl: 260,
			resave: false,
			saveUninitialized: false
		},
		settings: {
			url: "/#/settings"
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