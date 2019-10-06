'use strict'
import Promise       from 'bluebird'
import bodyParser    from 'body-parser'
import cookieParser  from 'cookie-parser'
import express       from 'express'
import session       from 'express-session'
import mongoose      from 'mongoose'
import logger        from 'morgan'
import passport      from 'passport'
import LocalStrategy from 'passport-local'
import path          from 'path'
import redis         from 'redis'

import config    from './config'
import {Account} from './models'

const auth      = require('./routes/auth')
const campaign  = require('./routes/campaign')
const campaigns = require('./routes/campaigns')
const content   = require('./routes/content')
const server    = require('./routes/index')
const users     = require('./routes/users')

const app = express()
console.log('config: ', config)
const redisClient = redis.createClient()
const redisStore  = require('connect-redis')(session)

redisClient.on('error', (err) => {
	console.log('Redis error: ', err)
})

mongoose.Promise = Promise
mongoose.connect(`${config.database.protocol}://${config.database.host}:${config.database.port}/${config.database.database}`)

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(logger(config.server.logger_format))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(session({
									secret           : config.server.secret,
									resave           : config.server.resave,
									saveUninitialized: config.server.saveUninitialized,
									store            : new redisStore(Object.assign({},
																																	{client: redisClient},
																																	config.redis))
								}))
passport.use(new LocalStrategy.Strategy({usernameField: 'username'}, Account.authenticate()))
passport.serializeUser(Account.serializeUser())
passport.deserializeUser(Account.deserializeUser())
app.use(passport.initialize())
app.use(passport.session())


app.use('/', server)
app.use('/api/campaigns', campaigns)
app.use('/api/campaign', campaign)
app.use('/api/user', users)
app.use('/auth', auth)

app.use(function (req, res) {
	res.status(500).end()
})

app.listen(3000, () => console.log('listening on 3000'))
module.exports = app
