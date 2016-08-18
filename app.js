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

mongoose.Promise = Promise;
mongoose.connect(config.mongoose.url);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(require('express-session')({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', index);
app.use('/api/campaigns', campaigns);
app.use('/api/campaign', campaign);
app.use('/api/content', content);
app.use('/api/user', users);
app.use('/auth', auth);

app.use(function (req, res) {
	res.status(500).end();
});

module.exports = app;
