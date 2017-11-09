'using strict'
const kue = require('kue-scheduler')
const logger = require('../logger')
const conf = require('../conf')
const Repository = require('../api/models/repo')

let queue

exports.init = (conf) => {
  return new Promise((resolve, reject) => {
    queue = kue.createQueue({
      prefix: conf.get('queue.prefix'),
      redis: {
        port: conf.get('queue.port'),
        host: conf.get('queue.host')
      }
    })

    queue.client.on('ready', () => {
      initUpdateScheduler()
      queue.watchStuckJobs()
      logger.info(`Redis connection to ${conf.get('queue.host')}:${conf.get('queue.port')} established.`)
      resolve(queue)
    })

    queue.client.on('error', (err) => {
      reject(err)
    })
  })
}

exports.close = () => {
  return new Promise((resolve, reject) => {
    queue.shutdown(null, '', (error) => {
      if (error) {
        reject(new Error(error))
      }
      resolve()
    })
  })
}

exports.getQueue = () => {
  return queue
}

const addUpdateSchedule = (repo) => {
  let task = queue.createJob('pull', repo)
  task
    .priority('high')
    .attempts(1)
    .removeOnComplete(true)
    .unique('pull_' + repo.name)
    .save((error) => {
      if (error) {
        logger.error(error)
        return
      }
      queue.every(`${conf.get('repository.git.pulling_schedule')} seconds`, task)
      logger.info(`Setup repository '${task.data.name}' (${task.data._id}) for scheduled updates.`)
    })
}

exports.addUpdateSchedule = addUpdateSchedule

const initUpdateScheduler = () => {
  queue.clear((error, response) => {
    if (error) {
      throw error
    }
    Repository
      .find()
      .then((repositories) => {
        repositories.forEach((repository) => {
          addUpdateSchedule(repository)
        })

        queue.on('schedule success', (job) => {
          job.on('complete', (result) => {
            if (job.type === 'pull') {
              logger.info(`[Scheduler] Update for repository '${job.data.name}' succeeded.`)
              Repository
                .findById({_id: job.data._id})
                .then((repo) => {
                  if (!repo) {
                    return
                  }
                  repo
                    .update({
                      $set: {
                        status: 'active',
                        updated: new Date()
                      }
                    })
                    .then(() => {})
                    .catch((error) => {
                      throw error
                    })
                })
                .catch((error) => {
                  logger.error(error)
                })
            }
          })

          job.on('failed', (reason) => {
            if (job.type === 'pull') {
              logger.info(`[Scheduler] Update for repository '${job.data.name}' failed.`)
              logger.error(reason)

              Repository
                .findById({_id: job.data._id})
                .then((repository) => {
                  if (!repository) {
                    return
                  }
                  repository
                    .update({
                      $set: {
                        status: 'failure'
                      }
                    })
                    .then(() => {})
                    .catch((error) => {
                      throw error
                    })
                })
                .catch((error) => {
                  logger.error(error)
                })
            }
          })
        })

        queue.on('schedule error', (error) => {
          logger.error(error)
        })
      })
  })
}

exports.kue = kue
