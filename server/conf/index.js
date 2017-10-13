const path = require('path')
const convict = require('convict')

let conf = convict({
  env: {
    doc: 'The applicaton environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  server: {
    port: {
      doc: 'The port to bind ExpressJS.',
      format: Number,
      default: 3001,
      env: 'PORT'
    }
  },
  database: {
    host: {
      doc: 'The database host name or IP address.',
      format: String,
      default: 'localhost'
    },
    name: {
      doc: 'The database name.',
      format: String,
      default: 'RepoDB3'
    }
  },
  api: {
    credentials: {
      secret: {
        doc: 'The secret used for JWT.',
        format: String,
        default: 'changeme',
        sensitive: true
      }
    }
  },
  repository: {
    git: {
      path: {
        doc: 'The location for the cloned repositories.',
        format: String,
        default: '/tmp'
      },
      depth: {
        doc: 'The initial depth during the clone process.',
        format: 'int',
        default: 10000
      },
      commits: {
        doc: 'The amount of commits to return per request',
        format: 'int',
        default: 1000
      },
      buffer: {
        doc: '',
        format: 'int',
        default: 1024000
      }
    }
  },
  logger: {
    path: {
      doc: 'The location for log files.',
      format: String,
      default: 'logs'
    }
  }
})

process.env.NODE_ENV = conf.get('env')

conf.loadFile(path.join(__dirname, conf.get('env') + '.json')).validate({allowed: 'strict'})

module.exports = conf
