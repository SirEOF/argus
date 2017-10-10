'use strict'
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const conf = require('../../conf')
const User = require('../models/user')

exports.signup = (req, res) => {
  let newUser = new User(req.body)

  newUser.hash_password = bcrypt.hashSync(req.body.password, 10)

  newUser.save((err, user) => {
    if (err) {
      return res.status(400).send({message: err})
    } else {
      user.hash_password = undefined
      return res.json(user)
    }
  })
}

exports.signin = (req, res) => {
  User.findOne({
    email: req.body.email
  }, (err, user) => {
    if (err) {
      throw err
    }
    if (!user || !user.comparePassword(req.body.password)) {
      return res.status(401).json({
        message: 'Authentication failed. Invalid user or password.'
      })
    } else if (user) {
      if (!user.comparePassword(req.body.password)) {
        res.status(401).json({ message: 'Authentication failed. Wrong password.' })
      } else {
        return res.json({
          token: jwt.sign({
            email: user.email, fullName: user.fullName, _id: user._id
          }, conf.get('api.credentials.secret'))
        })
      }
    }
  })
}

exports.loginRequired = (req, res, next) => {
  if (req.user) {
    // User is authenticated, move on.
    next()
  } else {
    return res.status(401).json({message: 'You are not an authorized user!'})
  }
}
