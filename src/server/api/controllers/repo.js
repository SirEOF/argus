'use strict'
const _ = require('lodash')

const {ObjectID} = require('mongodb')

const GitManager = require('../lib/git')
const Repository = require('../models/repo')
const Commit = require('../models/commit')
const GitWorker = require('../workers/git')

/**
 * Provide a list of every repository entry stored in the database.
 */
exports.list = (req, res, next) => {
  Repository
    .find()
    .then((repositories) => res.json(repositories))
    .catch(next)
}

/**
 * Add the requested repository details to the database and perform a clone of the repository in a
 * separate worker process.
 */
exports.add = (req, res, next) => {
  const meta = _.pick(req.body, ['name', 'remote'])

  new Repository(meta)
    .save()
    .then((repository) => {
      GitWorker
        .startTaskClone(repository)
      res.json(repository)
    })
    .catch(next)
}

/**
 * Find the requested repository by the provided Id in the database and return the log of commits.
 */
exports.commits = (req, res, next) => {
  const id = req.params.id

  if (!ObjectID.isValid(id)) {
    return next()
  }

  Repository
    .findById(id)
    .populate('commits')
    .lean()
    .then((repository) => {
      if (!repository) {
        return next()
      }
      res.json(repository.commits)
    })
    .catch(next)
}

/**
 * Find the requested repository by the provided Id in the database and send a new task to the
 * worker queue to perform a pull request on the found repository in a new worker process.
 */
exports.update = (req, res, next) => {
  const id = req.params.id

  if (!ObjectID.isValid(id)) {
    return next()
  }

  Repository
    .findById(id)
    .then((repository) => {
      if (!repository) {
        return next()
      }
      GitWorker.startTaskPull(repository)
      res.json({})
    })
    .catch(next)
}

/**
 * Find the repository by the provided ID in the database, remove the repository folder from disk
 * and then remove the entry from the database.
 */
exports.delete = (req, res, next) => {
  const id = req.params.id

  if (!ObjectID.isValid(id)) {
    return next()
  }

  Repository
    .findByIdAndRemove(id)
    .then((repository) => {
      if (!repository) {
        return next()
      }
      Commit
        .remove({_id: {$in: repository.commits}})
        .then(() => {
          GitManager
            .delete(repository.name)
            .then(() => res.json(repository))
            .catch(next)
        })
        .catch(next)
    })
    .catch(next)
}
