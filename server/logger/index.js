const winston = require('winston')

const conf = require('../conf')
const common = require('../lib/common')

const consoleOptions = {
  level: conf.get('env') === 'development' ? 'debug' : 'info',
  json: false,
  colorize: true,
  timestamp: () => common.timestamp(),
  humanReadableUnhandledException: true
}

const logger = new winston.Logger({
  transports: [
    new winston.transports.Console(consoleOptions)
  ]
})

module.exports = logger
