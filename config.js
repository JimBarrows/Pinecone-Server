/**
 * Created by JimBarrows on 10/1/19.
 */
import fs from "fs"

class Config {

	constructor () {
		this._currentEnvironment = process.env.NODE_ENV || defaultEnvironment()
		if (this._currentEnvironment == defaultEnvironment()) {
			this._config = {
				database: {
					protocol: process.env.DATABASE_PROTOCOL || 'mongodb',
					host    : process.env.DATABASE_HOST || 'localhost',
					port    : process.env.DATABASE_PORT || 27017,
					database: process.env.DATABASE_DATABSE || 'pinecone',
					user    : process.env.DATABASE_USER || 'pinecone',
					password: process.env.DATABASE_PASSWORD || 'pinecone'
				},
				facebook: {
					clientId             : process.env.FACEBOOK_CLIENTID || "1236802509686356",
					clientSecret         : process.env.FACEBOOK_CLIENTSECRET || "80fd99d15c54490d6558e3883c1bc40f",
					finishUrl            : process.env.FACEBOOK_FINISHURL || "http://127.0.0.1:8080/api/user/facebookAccount/finish/",
					grantType            : process.env.FACEBOOK_GRANTTYPE || "fb_exchange_token",
					requestTokenUrl      : process.env.FACEBOOK_REQUESTTOKENURL || "https://graph.facebook.com/oauth/access_token",
					requestTokenUrlMethod: process.env.FACEBOOK_REQUESTTOKENURLMETHOD || "POST"

				},
				rabbitMq: {
					url: process.env.RABBITMQ_URL || "amqp://localhost"
				},
				redis   : {
					host             : process.env.REDIS_HOST || "localhost",
					port             : process.env.REDIS_PORT || 6379,
					ttl              : process.env.REDIS_TTL || 260,
					resave           : process.env.REDIS_RESAVE || false,
					saveUninitialized: process.env.REDIS_SAVEUNINITIALIZED || false
				},
				server  : {
					cors         : process.env.SERVER_CORS || {},
					endpoint     : process.env.SERVER_ENDPOINT || '/',
					logger_format: process.env.LOGGER_FORMAT || 'dev',
					name         : process.env.SERVER_NAME || "people_and_organizations-endpoint-graphql",
					playground   : process.env.SERVER_PLAYGROUND || '/',
					port         : process.env.SERVER_PORT || 3000,
					secret       : process.env.SERVER_SESSION_SECRET || 'whiskey tango foxtrot november sierra foxtrot whiskey',
					subscriptions: process.env.SERVER_SUBSCRIPTIONS || '/',
					tracing      : process.env.SERVER_TRACING || true,
					uploads      : process.env.SERVER_UPLOADS || {maxFieldSize: 1024, maxFileSize: 1024, maxFiles: 1},
					version      : process.env.SERVER_VERSION || "0.1.0",
					url          : process.env.SERVER_URL || "http://localhost"
				},
				twitter : {
					publicKey            : process.env.TWITTER_PUBLICKEY || "CEmmg8lwj4OQsTEw9orBF7VAc",
					secretKey            : process.env.TWITTER_SECRETKEY || "YrKdLxTB74VPrg1o4wsaK8moPEKG4bNmK6vawvlAgmSUoVuGBY",
					requestTokenUrl      : process.env.TWITTER_REQUESTTOKENURL || "https://api.twitter.com/oauth/request_token",
					requestTokenUrlMethod: process.env.TWITTER_REQUESTTOKENURL || "POST",
					finishUrl            : process.env.TWITTER_FINISHURL || "http://127.0.0.1:8080/api/user/twitterAccount/finish/"
				}
			}
		} else {
			this._config = JSON.parse(fs.readFileSync(`config.${this.currentEnvironment}.json`, "utf8"))
		}
	}

	get currentEnvironment () {
		return this._currentEnvironment
	}

	get database () {
		return this._config.database
	}

	get facebook () {
		return this._config.facebook
	}

	get rabbitMq () {
		return this._config.rabbitMq
	}

	get redis () {
		return this._config.redis
	}

	get server () {
		return this._config.server
	}

	get twitter () {
		return this._config.twitter
	}
}

const config = new Config()
export default config

export function defaultEnvironment () {
	return "default"
}

export function developmentEnvironment () {
	return "dev"
}

export function environments () {
	return [Config.defaultEnvironment(), Config.localEnvironment(), Config.developmentEnvironment(), Config.qaEnvironment(), Config.qaEnvironment(), Config.stagingEnvironment(), Config.prodEnvironment()]
}

export function localEnvironment () {
	return "local"
}

export function prodEnvironment () {
	return "prod"
}

export function qaEnvironment () {
	return "qa"
}

export function stagingEnvironment () {
	return "staging"
}
