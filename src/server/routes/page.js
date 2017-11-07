'use strict'
const router = require('express').Router()

router
  .route('/')
  .get((req, res, next) => {
    res.render('index', { title: 'Argus' })
  })

module.exports = router
