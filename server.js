'use strict'
import Promise       from "bluebird"
import bodyParser    from "body-parser"
import cookieParser  from "cookie-parser"
import express       from "express"
import session       from "express-session"
import mongoose      from "mongoose"
import logger        from "morgan"
import path          from "path"
import process       from "process"
import Configuration from "./configurations"
import passport      from "./passport.config"

const auth      = require('./routes/auth')
const campaign  = require('./routes/campaign')
const campaigns = require('./routes/campaigns')
const content   = require('./routes/content')
const server    = require('./routes/index')
const users     = require('./routes/users')

const app    = express()
const env    = process.env.NODE_ENV || "development"
const config = Configuration[env]
console.log("config: ", config)
const redis      = require('redis')
const RedisStore = require("connect-redis")(session)
const client     = redis.createClient()
const redisStore = new RedisStore(client)

mongoose.Promise = Promise
mongoose.connect(config.mongoose.url)

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(session({
									secret           : "whiskey tango foxtrot november sierra foxtrot whiskey",
									store            : redisStore,
									resave           : config.redis.resave,
									saveUninitialized: config.redis.saveUninitialized
								}))
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
