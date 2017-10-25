'using strict'
const conf = require('../conf')
const kue = require('kue-scheduler')

let queue = kue.createQueue({
  prefix: conf.get('queue.prefix'),
  redis: {
    port: conf.get('queue.port'),
    host: conf.get('queue.host')
  }
})

module.exports = {kue, queue}
