'use strict'
const mongoose = require('mongoose')

let CommitSchema = new mongoose.Schema({
  status: {
    type: Array,
    trim: true
  },
  files: {
    type: Array,
    trim: true
  },
  hash: {
    type: String,
    trim: true
  },
  subject: {
    type: String,
    trim: true
  },
  authorEmail: {
    type: String,
    trim: true
  },
  committerDate: {
    type: String,
    trim: true
  }
})

module.exports = mongoose.model('Commit', CommitSchema)
