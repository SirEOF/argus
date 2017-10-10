'use strict'
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const conf = require('../../conf')
const User = require('../models/user')

exports.signup = (req, res) => {
  let newUser = new User(req.body)

  newUser.hash_password = bcrypt.hashSync(req.body.password, 10)

  newUser
    .save()
    .then((user) => {
      user.hash_password = undefined
      return res.json(user)
    })
    .catch((error) => {
      return res.status(400).send({message: error.errmsg})
    })
}

exports.signin = (req, res) => {
  User
    .findOne({email: req.body.email})
    .then((user) => {
      if (!user || !user.comparePassword(req.body.password)) {
        return res.status(401).json({message: 'Authentication failed.'})
      }
      return res.json({
        token: jwt.sign({
          _id: user._id,
          email: user.email,
          username: user.username
        }, conf.get('api.credentials.secret'))
      })
    })
    .catch((error) => {
      throw error
    })
}

exports.loginRequired = (req, res, next) => {
  if (req.user) {
    // User is authenticated, move on.
    next()
  } else {
    return res.status(401).send({message: 'You are not an authorized user!'})
  }
}
