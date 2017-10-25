'using strict'
const {kue, queue} = require('../../queue/kue')
const logger = require('../../logger')
const GitManager = require('../lib/git')
const Repository = require('../models/repo')
const Commit = require('../models/commit')

queue.process('clone', 4, function (task, done) {
  Repository
    .findById(task.data.id)
    .then((repository) => {
      if (!repository) {
        throw new Error('Repository not found.')
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
                .set({head: repository.commits[0].hash, status: 'active'})
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

exports.startTaskClone = (meta) => {
  const task = queue.create('clone', {name: meta.name, id: meta.id})

  task
    .on('enqueue', () => {
      logger.info(`Task: ${task.id}-${task.data.name} is queued.`)
    })
    .on('start', () => {
      // Repository.findById(task.data.id).update()
      logger.info(`Task ${task.id}-${task.data.name} started.`)
    })
    .on('complete', () => {
      logger.info(`Task ${task.id}-${task.data.name} is done.`)
      // set db entry to 'active'
    })
    .on('failed', () => {
      logger.info(`Task ${task.id}-${task.data.name} has failed.`)
    })
    .on('error', (error) => {
      logger.info(`Task ${task.id}-${task.data.name} produced an error:\n${error}`)
      Repository
        .findByIdAndRemove(task.data.id)
        .then(() => {})
        .catch((error) => logger.error(error))
    })
    .on('remove', () => {
      logger.info(`Task ${task.id}-${task.data.name} is removed.`)
    })

  task
    .priority('high')
    .attempts(1)
    .backoff({type: 'exponential'})
    .removeOnComplete(true)
    .save()
}

queue.process('pull', 4, function (task, done) {
  Repository
    .findById(task.data.id)
    .then((repository) => {
      if (!repository) {
        throw new Error('Repository not found.')
      }
      logger.info('Perform update of repository:', repository.remote)
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
              .then(() => { })
              .catch((error) => { return done(error) })
          })
          .catch((error) => { return done(error) })
        })
        .catch((error) => { return done(error) })
    })
    .catch((error) => { return done(error) })
})

exports.startTaskPull = (meta) => {
  const task = queue.createJob('pull', {name: meta.name, id: meta.id})

  task
    .on('enqueue', () => {
      logger.info(`Task: ${task.id}-${task.data.name} is queued.`)
    })
    .on('start', () => {
      logger.info(`Task: ${task.id}-${task.data.name} started.`)
    })
    .on('complete', () => {
      logger.info(`Task: ${task.id}-${task.data.name} is done.`)
    })
    .on('failed', () => {
      logger.info(`Task: ${task.id}-${task.data.name} has failed.`)
      kue.Job.get(task.id)
        .then((job) => {
          job.remove()
        })
        .catch((error) => { throw error })
    })
    .on('error', (error) => {
      logger.info(`Task: ${task.id}-${task.data.name} produced an error:\n${error}`)
    })
    .on('remove', () => {
      logger.info(`Task: ${task.id}-${task.data.name} is removed.`)
    })

  task
    .priority('high')
    .attempts(1)
    .backoff({type: 'exponential'})
    .removeOnComplete(true)
    .save()

  queue.watchStuckJobs()
  queue.every('60 seconds', task)
}
