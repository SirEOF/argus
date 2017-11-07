#!/usr/bin/env node
'use strict'
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const path = require('path')
const favicon = require('serve-favicon')
const compression = require('compression')
const helmet = require('helmet')
const expressLogger = require('./logger/express')
const user = require('./api/routes/user')
const repo = require('./api/routes/repo')

module.exports.init = (app, conf) => {
  /* Add middleware */
  app.set('json spaces', 4)
  app.use(compression({
    level: 9,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false
      }
      return compression.filter(req, res)
    }
  }))
  app.use(helmet())

  app.set('views', path.join(__dirname, 'views'))
  app.set('view engine', 'pug')

  app.use(favicon(path.join(__dirname, 'public', 'favicon.png')))

  const webpack = require('webpack')
  const webpackConfig = require('../../webpack.config')
  const compiler = webpack(webpackConfig)

  app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true, publicPath: webpackConfig.output.publicPath
  }))

  app.use(require('webpack-hot-middleware')(compiler, {
    log: console.log, path: '/__webpack_hmr', heartbeat: 10 * 1000
  }))

  app.get('*.js', (req, res, next) => {
    req.url = req.url + '.gz'
    res.set('Content-Encoding', 'gzip')
    res.set('Content-Type', 'text/javascript')
    next()
  })

  app.get('*.css', (req, res, next) => {
    req.url = req.url + '.gz'
    res.set('Content-Encoding', 'gzip')
    res.set('Content-Type', 'text/css')
    next()
  })

  app.use(require('express').static(path.join(__dirname, 'public')))

  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())

  // Logger to capture all requests and output them to the console.
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

  // Add route which will load our Vue app.
  app.use('/', require('./routes/page'))

  // Add routes to middleware.
  app.use('/', user)
  app.use('/api/v1', repo)
  // app.use('/private/kue-ui', require('kue').app)

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
}
