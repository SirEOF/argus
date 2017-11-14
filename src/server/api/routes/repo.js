'use strict'
const router = require('express').Router()

const repo = require('../controllers/repo')
const user = require('../controllers/user')

router
  .route('/repo')
  .get(user.loginRequired, repo.list)
  .post(user.loginRequired, repo.add)

router
  .route('/repo/:id')
  .get(user.loginRequired, repo.commits)
  .delete(user.loginRequired, repo.delete)
  .put(user.loginRequired, repo.update)

router
  .route('/repo/:id/:commit')
  .get(user.loginRequired, repo.commit)

module.exports = router
