const express      = require('express');
const path         = require('path');
const favicon      = require('serve-favicon');
const logger       = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
const mongoose     = require('mongoose')
		, Promise      = require('bluebird');
const process      = require('process');
const passport     = require('./passport.config.js');
const index        = require('./routes/index');
const users        = require('./routes/users');
const auth         = require('./routes/auth');
const campaigns    = require('./routes/campaigns');
const campaign     = require('./routes/campaign');
const content      = require('./routes/content');
const app          = express();
import Configuration from "./configurations";
const env    = process.env.NODE_ENV || "development";
const config = Configuration[env];
console.log("config: ", config);

mongoose.Promise = Promise;
mongoose.connect(config.mongoose.url);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

console.log("Setting up use");
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

console.log("Seting api's and routes");
app.use('/', index);
app.use('/api/campaigns', campaigns);
// app.use('/api/campaigns/:campaignid', campaign);
app.use('/api/content', content);
app.use('/api/user', users);
app.use('/auth', auth);

console.log("Error handling");
app.use(function (req, res, next) {
	const err  = new Error('Not Found');
	err.status = 404;
	next(err);
});

console.log("Environment based error handling");
if (app.get('env') === 'development') {
	app.use(function (err, req, res) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
console.log("roduction error handler handling");
app.use(function (err, req, res) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});


module.exports = app;
