'using strict'
const express = require('express')
const conf = require('./conf')
const queue = require('./queue/kue')
const db = require('./db/mongoose')
const logger = require('./logger')

const app = express()

Promise
  .all([queue.init(conf), db.init(conf)])
  .then(() => {
    require('./router').init(app, conf)

    const server = app.listen(conf.get('server.port'), () => {
      logger.info(`ExpressJS listens on port ${conf.get('server.port')}.`)
      logger.info(`Node environment "${process.env.NODE_ENV}" with PID ${process.pid} launched.`)
    })

    const shutdown = async (exitcode) => {
      console.log('')
      logger.info('Shutdown command received ...')
      try {
        await queue.close()
        logger.info('Kue connection has been shutdown.')
      } catch (error) {
        logger.error('Unable to shutdown Kue.')
      }
      try {
        await db.close()
        logger.info('Mongoose connection has been shutdown.')
      } catch (error) {
        logger.error('Unable to shutdown Mongoose.')
      }
      try {
        await server.close()
        logger.info('ExpressJS has been shutdown.')
      } catch (error) {
        logger.error('Unable to shutdown ExpressJS.')
      }
      logger.info('Exiting process ...')
      process.exit(exitcode || 0)

      setTimeout(() => {
        logger.info('Could not close some connection in time, forcefully shutting down.')
        process.exit(exitcode || 0)
      }, 10 * 1000)
    }

    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
    process.once('uncaughtException', (error) => {
      logger.error('Kue: ', error)
      shutdown(1)
    })
  })
  .catch((error) => {
    logger.error(error)
    process.exit(1)
  })

module.exports = app
