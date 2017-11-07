'use strict'
const path = require('path')

const fs = require('fs-extra')
const winston = require('winston')
const expressWinston = require('express-winston')

const conf = require('../conf')
const common = require('../lib/common')

try {
  fs.ensureDirSync(conf.get('logger.path'))
} catch (error) {
  console.log(error)
  process.exit(1)
}

const consoleOptions = {
  level: conf.get('env') === 'development' ? 'debug' : 'info',
  colorize: true,
  timestamp: () => common.timestamp(),
  prettyPrint: true,
  humanReadableUnhandledException: true
}

const fileOptions = {
  level: conf.get('env') === 'development' ? 'debug' : 'info',
  filename: path.join(conf.get('logger.path'), 'server.log'),
  json: false,
  prettyPrint: true,
  timestamp: () => common.timestamp(),
  maxsize: 5242880,
  maxFiles: 4,
  tailable: true,
  zippedArchive: true
}

const expressLogger = expressWinston.logger({
  transports: [
    new winston.transports.File(fileOptions),
    new winston.transports.Console(consoleOptions)
  ]
})

const expressErrorLogger = expressWinston.errorLogger({
  transports: [
    new winston.transports.File(fileOptions),
    new winston.transports.Console(consoleOptions)
  ],
  exitOnError: true
})

module.exports = {expressLogger, expressErrorLogger}
