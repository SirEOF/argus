'use strict'
const mongoose = require('mongoose')

const conf = require('../conf')
const logger = require('../logger')

// Use native Node promises.
mongoose.Promise = global.Promise

const databaseURI = `mongodb://${conf.get('database.host')}/${conf.get('database.name')}`

mongoose.connect(databaseURI, {useMongoClient: true})
  .then(() => logger.info('MongoDB connection established.'))
  .catch(() => {
    logger.error('MongoDB failed to connect to server.')
    process.exit(1)
  })

module.exports = mongoose
