'use strict'
const mongoose = require('mongoose')
const logger = require('../logger')

exports.init = (conf) => {
  return new Promise((resolve, reject) => {
    mongoose.Promise = Promise

    const databaseURI = `mongodb://${conf.get('database.host')}/${conf.get('database.name')}`

    mongoose.connection.on('disconnected', () => {
      reject(new Error('Mongoose default connection is disconnected.'))
    })

    mongoose.connection.on('error', () => {
      reject(new Error('MongoDB failed to connect to server.'))
    })

    mongoose.connection.once('open', () => {
      logger.info(`MongoDB connection to ${databaseURI} established.`)
    })

    mongoose
      .connect(databaseURI, {useMongoClient: true})
      .then(() => { resolve(mongoose) })
      .catch((error) => { reject(error) })
  })
}

exports.close = () => {
  return mongoose.connection.close()
}

exports.mongoose = mongoose
