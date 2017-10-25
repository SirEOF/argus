const express = require('express')
const conf = require('./conf')
const router = require('./router')
const logger = require('./logger')

let app = express()

router.init(app, conf)

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

process.title = 'argus'

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
