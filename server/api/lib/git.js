'using strict'
const path = require('path')

const fs = require('fs-extra')
const git = require('simple-git/promise')
const gitlog = require('gitlog')

const conf = require('../../conf')

exports.clone = (remote, name) => {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(name)) {
      reject(new Error(`Repository with the name '${name}' does already exists.`))
    }
    git(conf.get('repository.git.path'))
      .clone(remote, name, {depth: conf.get('repository.git.depth')})
      .then(() => resolve())
      .catch((error) => reject(error))
  })
}

exports.pull = (name) => {
  return new Promise((resolve, reject) => {
    const repodir = path.join(conf.get('repository.git.path'), name)
    if (!fs.existsSync(repodir)) {
      reject(new Error(`Repository directory '${repodir}' does not exist.`))
    }
    git(repodir)
      .pull()
      .then(() => resolve())
      .catch((error) => reject(error))
  })
}

exports.log = (name) => {
  // Using 'gitlog' here which has better built-in capabilities for parsing the files of a commit.
  const options = {
    repo: path.join(conf.get('repository.git.path'), name),
    number: conf.get('repository.git.commits'),
    fields: ['hash', 'subject', 'authorEmail', 'committerDate'],
    execOptions: { maxBuffer: conf.get('repository.git.buffer') }
  }
  return new Promise((resolve, reject) => {
    gitlog(options, function (error, commits) {
      if (error) {
        reject(error)
      } else {
        resolve(commits)
      }
    })
  })
}

exports.delete = (name) => {
  return new Promise((resolve, reject) => {
    fs.remove(path.join(conf.get('repository.git.path'), name))
    .then(() => resolve())
    .catch(error => reject(error))
  })
}

exports.newCommits = (entries, hash) => {
  for (let i = 0; i < entries.length; i++) {
    if (entries[i].hash === hash) {
      return entries.slice(0, i)
    }
  }
  return []
}
