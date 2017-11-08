/*
  Copyright (c) 2016, Dominic Harrington
                2017, Christoph Diehl

  All rights reserved.

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

  1. Redistributions of source code must retain the above copyright notice, this
     list of conditions and the following disclaimer.
  2. Redistributions in binary form must reproduce the above copyright notice,
     this list of conditions and the following disclaimer in the documentation
     and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
  DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
  ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

  The views and conclusions contained in the software and documentation are those
  of the authors and should not be interpreted as representing official policies,
  either expressed or implied, of the FreeBSD Project.
*/
'using strict'
const exec = require('child_process').exec
const execSync = require('child_process').execSync
const debug = require('debug')('gitlog')
const extend = require('lodash.assign')
const delimiter = '\t'
const fields = {
  hash: '%H',
  abbrevHash: '%h',
  treeHash: '%T',
  abbrevTreeHash: '%t',
  parentHashes: '%P',
  abbrevParentHashes: '%P',
  authorName: '%an',
  authorEmail: '%ae',
  authorDate: '%ai',
  authorDateRel: '%ar',
  committerName: '%cn',
  committerEmail: '%ce',
  committerDate: '%ci',
  committerDateRel: '%cr',
  subject: '%s',
  body: '%b',
  rawBody: '%B'
}
const notOptFields = ['status', 'files']

/*
Add optional parameter to command.
*/
function addOptional (command, options) {
  const cmdOptional = ['author', 'since', 'after', 'until', 'before', 'committer']
  for (let i = cmdOptional.length; i--;) {
    if (options[cmdOptional[i]]) {
      command += ' --' + cmdOptional[i] + '="' + options[cmdOptional[i]] + '"'
    }
  }
  return command
}

function gitlog (options, cb) {
  if (!options.repo) {
    throw new Error('A repository is required!')
  }

  const defaultOptions = {
    number: 10,
    fields: ['abbrevHash', 'hash', 'subject', 'authorName'],
    nameStatus: true,
    findCopiesHarder: false,
    all: false,
    execOptions: {}
  }

  // Set defaults.
  options = extend(defaultOptions, options)

  const prevWorkingDir = process.cwd()
  try {
    process.chdir(options.repo)
  } catch (e) {
    throw new Error('The repository location does not exist!')
  }

  // Start constructing command.
  let command = 'git log '

  if (options.findCopiesHarder) {
    command += '--find-copies-harder '
  }

  if (options.all) {
    command += '--all '
  }

  command += '-n ' + options.number

  command = addOptional(command, options)

  // Start of custom format.
  command += ' --pretty="@begin@'

  // Iterating through the fields and adding them to the custom format.
  options.fields.forEach(function (field) {
    if (!fields[field] && field.indexOf(notOptFields) === -1) {
      throw new Error('Unknown field: ' + field)
    }
    command += delimiter + fields[field]
  })

  // Close custom format.
  command += '@end@"'

  // Append branch (revision range) if specified.
  if (options.branch) {
    command += ' ' + options.branch
  }

  if (options.file) {
    command += ' -- ' + options.file
  }

  // File and file status.
  command += fileNameAndStatus(options)

  debug('command', options.execOptions, command)

  if (!cb) {
    const stdout = execSync(command, options.execOptions).toString()
    let commits = stdout.split('\n@begin@')

    if (commits.length === 1 && commits[0] === '') {
      commits.shift()
    }

    debug('commits', commits)

    commits = parseCommits(commits, options.fields, options.nameStatus)

    process.chdir(prevWorkingDir)

    return commits
  }

  exec(command, options.execOptions, function (err, stdout, stderr) {
    debug('stdout', stdout)
    let commits = stdout.split('\n@begin@')
    if (commits.length === 1 && commits[0] === '') {
      commits.shift()
    }
    debug('commits', commits)

    commits = parseCommits(commits, options.fields, options.nameStatus)

    cb(stderr || err, commits)
  })

  process.chdir(prevWorkingDir)
}

function fileNameAndStatus (options) {
  return options.nameStatus ? ' --name-status' : ''
}

function parseCommits (commits, fields, nameStatus) {
  return commits.map(function (commit) {
    const parts = commit.split(commit.includes('\n\n') ? '@end@\n\n' : '@end@')

    commit = parts[0].split(delimiter)

    if (parts[1]) {
      let parseNameStatus = parts[1].split('\n')

      // Removes last empty char if exists.
      if (parseNameStatus[parseNameStatus.length - 1] === '') {
        parseNameStatus.pop()
      }

      // Split each line into it's own delimitered array.
      parseNameStatus.forEach(function (d, i) {
        parseNameStatus[i] = d.split(delimiter)
      })

      // 0 will always be status, last will be the filename as it is in the commit,
      // anything inbetween could be the old name if renamed or copied.
      parseNameStatus = parseNameStatus.reduce(function (a, b) {
        let tempArr = [b[0], b[b.length - 1]]

        // If any files in between loop through them.
        for (let i = 1, len = b.length - 1; i < len; i++) {
          // If status R then add the old filename as a deleted file + status
          // Other potentials are C for copied but this wouldn't require the original deleting
          if (b[0].slice(0, 1) === 'R') {
            tempArr.push('D', b[i])
          }
        }

        return a.concat(tempArr)
      }, [])

      commit = commit.concat(parseNameStatus)
    }

    debug('commit', commit)

    // Remove the first empty char from the array.
    commit.shift()

    let parsed = {}

    if (nameStatus) {
      // Create arrays for non optional fields if turned on.
      notOptFields.forEach(function (d) {
        parsed[d] = []
      })
    }

    commit.forEach(function (commitField, index) {
      if (fields[index]) {
        parsed[fields[index]] = commitField
      } else {
        if (nameStatus) {
          const pos = (index - fields.length) % notOptFields.length

          debug('nameStatus', (index - fields.length), notOptFields.length, pos, commitField)
          parsed[notOptFields[pos]].push(commitField)
        }
      }
    })

    return parsed
  })
}

module.exports = gitlog
