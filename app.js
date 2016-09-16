'use strict';
import bodyParser from "body-parser";
import Configuration from "./configurations";
import cookieParser from "cookie-parser";
import express from "express";
import logger from "morgan";
import mongoose from "mongoose";
import passport from "./passport.config";
import path from "path";
import process from "process";
import Promise from "bluebird";
import session from "express-session";

const auth      = require('./routes/auth');
const campaign  = require('./routes/campaign');
const campaigns = require('./routes/campaigns');
const content   = require('./routes/content');
const index     = require('./routes/index');
const users     = require('./routes/users');

const app    = express();
const env    = process.env.NODE_ENV || "development";
const config = Configuration[env];
console.log("config: ", config);

const RedisStore = require("connect-redis")(session);
const redisStore = new RedisStore({
	host: config.redis.host,
	port: config.redis.port,
	ttl: config.redis.ttl
});

mongoose.Promise = Promise;
mongoose.connect(config.mongoose.url);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
	secret: "whiskey tango foxtrot november sierra foxtrot whiskey",
	store: redisStore,
	resave: config.redis.resave,
	saveUninitialized: config.redis.saveUninitialized
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', index);
app.use('/api/campaigns', campaigns);
app.use('/api/campaign', campaign);
app.use('/api/user', users);
app.use('/auth', auth);

app.use(function (req, res) {
	res.status(500).end();
});

module.exports = app;
