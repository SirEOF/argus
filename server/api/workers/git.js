'using strict'
const queue = require('../../queue/kue')
const logger = require('../../logger')
const GitManager = require('../lib/git')
const Repository = require('../models/repo')
const Commit = require('../models/commit')

let tasks = queue.getQueue()

tasks.process('clone', 4, function (task, done) {
  Repository
    .findById(task.data._id)
    .then((repository) => {
      if (!repository) {
        return done('The requested repository does not exist in the repository directory.')
      }
      logger.info('Performing clone of repository:', repository.remote)
      GitManager
        .clone(repository.remote, repository.name)
        .then(() => {
          GitManager
            .log(repository.name)
            .then((entries) => {
              logger.info(`New commits found: ${entries.length}`)
              entries.forEach(function (entry) {
                let commit = new Commit(entry)
                repository.commits.push(commit)
                commit
                  .save()
                  .catch((error) => { return done(error) })
              })
              repository
                .set({head: repository.commits[0].hash})
                .save()
                .then(() => { return done() })
                .catch((error) => { return done(error) })
            })
            .catch((error) => { return done(error) })
        })
        .catch((error) => { return done(error) })
    })
    .catch((error) => { return done(error) })
})

/**
 * Setup task to clone a repository, create work directory and add the commits to the database.
 * @param  {[type]} meta repository directory entry
 */
exports.startTaskClone = (meta) => {
  const name = 'clone'
  const task = tasks.create(name, meta)

  task
    .on('enqueue', () => {
      logger.debug(`Task '${task.data.name}-${task.id}' is queued.`)
    })
    .on('start', () => {
      logger.info(`Task '${task.data.name}-${task.id}' started.`)
      Repository
        .findById({_id: task.data._id})
        .then((repository) => {
          if (!repository) {
            throw new Error('The requested repository does not exist in the repository directory.')
          }
          repository
            .update({
              $set: {
                status: 'pending'
              }
            })
            .then(() => {})
            .catch((error) => {
              throw error
            })
        })
        .catch((error) => {
          logger.error(error.message)
        })
    })
    .on('complete', () => {
      logger.info(`Task '${task.data.name}-${task.id}' is done.`)
      Repository
        .findById(task.data._id)
        .then((repository) => {
          queue.addUpdateSchedule(repository)
          repository
            .update({
              $set: {
                status: 'active'
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
    })
    .on('error', (error) => {
      logger.error(`Task '${task.data.name}-${task.id}' produced an error:\n${error}`)
    })
    .on('failed', () => {
      logger.error(`Task '${task.data.name}-${task.id}' has failed.`)
      Repository
        .findByIdAndRemove(task.data._id)
        .then(() => {
          logger.warn(`Removed repository entry of '${task.data.remote}' due to failure.`)
        })
        .catch((error) => {
          logger.error(error)
        })
    })
    .on('remove', () => {
      logger.info(`Task '${task.data.name}-${task.id}' is removed.`)
    })

  task
    .priority('high')
    .attempts(4)
    .backoff({delay: 5000, type: 'exponential'})
    .removeOnComplete(true)
    .save()
}

tasks.process('pull', 4, function (task, done) {
  Repository
    .findById(task.data._id)
    .then((repository) => {
      if (!repository) {
        tasks.remove({unique: `pull_${task.data.name}`})
        logger.info(`The scheduler for 'pull_${task.data.name}' has been removed.`)
        return done('The requested repository was not found.')
      }
      logger.info('Performing update of repository:', repository.remote)
      GitManager
        .pull(repository.name)
        .then(() => {
          GitManager
          .log(repository.name)
          .then((entries) => {
            let pulledEntries = GitManager.newCommits(entries, repository.head)
            if (!pulledEntries.length) {
              return done()
            }
            const newCommits = []
            for (let i = 0; i < pulledEntries.length; i++) { // Commit.insert(entries)
              let commit = new Commit(pulledEntries[i])
              commit.save()
              newCommits.push(commit)
            }
            repository
              .update({
                $push: {
                  commits: {
                    $each: newCommits,
                    $position: 0
                  }
                },
                $set: {
                  head: newCommits[0].hash
                }
              })
              .then(() => { return done() })
              .catch((error) => { return done(error) })
          })
          .catch((error) => { return done(error) })
        })
        .catch((error) => { return done(error) })
    })
    .catch((error) => { return done(error) })
})

/**
 * Setup task to pull latest commits from repository and add them to the database.
 * @param  {[type]} meta repository directory entry
 */
exports.startTaskPull = (meta) => {
  const name = 'pull'
  const task = tasks.create(name, meta)

  task
    .on('enqueue', () => {
      logger.debug(`Task '${task.data.name}-${task.id}' is queued.`)
    })
    .on('start', () => {
      logger.info(`Task ${task.data.name}-${task.id} started.`)
      Repository
        .findById({_id: task.data._id})
        .then((repository) => {
          repository
            .update({
              $set: {
                status: 'pending'
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
    })
    .on('complete', () => {
      logger.info(`Task '${task.data.name}-${task.id}' is done.`)
      Repository
        .findOneAndUpdate({_id: task.data._id})
        .then((repository) => {
          repository
            .update({
              $set: {
                updated: new Date(),
                status: 'active'
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
    })
    .on('error', (error) => {
      logger.error(`Task '${task.data.name}-${task.id}' produced an error:\n${error}`)
    })
    .on('failed', () => {
      logger.error(`Task '${task.data.name}-${task.id}' has failed.`)
      Repository
        .findOneAndUpdate({_id: task.data._id})
        .then((repository) => {
          repository
            .update({
              $set: {
                status: 'failed'
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
    })
    .on('remove', () => {
      logger.info(`Task: ${task.id}-${task.data.name} is removed.`)
    })

  task
    .priority('high')
    .attempts(1)
    .removeOnComplete(true)
    .save()
}
