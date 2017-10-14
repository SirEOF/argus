#!/usr/bin/env node
'use strict'
const express = require('express')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const kue = require('kue')
const compression = require('compression')
const helmet = require('helmet')

const conf = require('./conf')
const logger = require('./logger')
const expressLogger = require('./logger/express')
require('./db/mongoose')

const user = require('./api/routes/user')
const repo = require('./api/routes/repo')

let app = express()

/* Add middleware */
app.set('json spaces', 4)
app.use(compression())
app.use(helmet())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

/* Logger to capture all requests and output them to the console. */
app.use(expressLogger.expressLogger)

// Middleware which is called on every request.
app.use(function (req, res, next) {
  let token = req.headers['x-access-token']

  if (!token) {
    // We do not have x-access-token set and continue.
    req.user = undefined
    return next()
  }

  // We received x-access-token and treat it as a login request.
  jwt.verify(token, conf.get('api.credentials.secret'), (error, decoded) => {
    if (error) {
      req.user = undefined
    }
    // We continue with the next authentication method.
    req.user = decoded
    next()
  })
})

// Add routes to middleware.
app.use('/', user)
app.use('/api', repo)
app.use('/private/kue-ui', kue.app)

// Logger to capture any top-level errors and output JSON diagnostic info.
app.use(expressLogger.expressErrorLogger)

// Catch 404 and forward to error handler.
app.use(function (req, res, next) {
  const err = new Error(`${req.originalUrl} was not found.`)
  err.status = 404
  next(err)
})

if (conf.get('env') === 'development' || conf.get('env') === 'test') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500).json({error: {message: err.message}})
  })
}
if (conf.get('env') === 'production') {
  // Production error handler.
  app.use(function (err, req, res, next) {
    res.status(err.status || 500).json({message: err.message, error: {}})
  })
}

// Run this app.
const server = app.listen(conf.get('server.port'), () => {
  logger.info(`API app started to listen on port ${conf.get('server.port')} in ${conf.get('env')} mode.`)
})

// Shutdown routines for this server.
let shutdown = () => {
  logger.info('Shutdown command received ...')
  logger.info('Shutting down the server.')

  server.close(() => {
    logger.info('Server has been shutdown.')
    logger.info('Exiting process ...')
    process.exit(0)
  })

  setTimeout(() => {
    logger.info('Could not close connection in time, forcefully shutting down.')
    process.exit(0)
  }, 10 * 1000)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

module.exports = app
