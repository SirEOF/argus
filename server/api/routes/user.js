'use strict'
const router = require('express').Router()

const user = require('../controllers/user')

router
  .route('/signup')
  .post(user.signup)

router
  .route('/signin')
  .post(user.signin)

module.exports = router
