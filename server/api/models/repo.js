'use strict'
const mongoose = require('mongoose')

let RepositorySchema = new mongoose.Schema({
  name: {
    type: String,
    lowercase: true,
    required: true,
    unique: true,
    trim: true
  },
  remote: {
    type: String,
    lowercase: true,
    trim: true,
    required: true
  },
  head: {
    type: String,
    trim: true
  },
  branch: {
    type: String,
    trim: true,
    default: ['master']
  },
  updated: {
    type: Date,
    default: Date.now
  },
  status: {
    type: [{
      type: String,
      enum: ['queued', 'pending', 'active', 'inactive', 'failed']
    }],
    default: 'queued'
  },
  commits: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Commit'
  }]
})

RepositorySchema.methods.toJSON = function () {
  let obj = this.toObject()
  obj.commits = obj.commits.length
  return obj
}

module.exports = mongoose.model('Repository', RepositorySchema)
