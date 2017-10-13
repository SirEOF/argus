/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
'using strict'
const chai = require('chai')
const jwt = require('jsonwebtoken')

const conf = require('../conf')
const server = require('../server')
const User = require('../api/models/user')
const Repo = require('../api/models/repo')
const GitManager = require('../api/lib/git')

chai.use(require('chai-http'))

const expect = chai.expect
const request = chai.request

const users = [
  {
    'username': 'John Doe',
    'email': 'johndoe@acme.com',
    'password': '1q2w3e4r'
  }
]

const repos = [
  {
    'name': 'argus',
    'remote': 'https://github.com/mozillasecurity/argus'
  }
]

before(function (done) {
  GitManager
    .delete(repos[0].name)
    .then(() => done())
    .catch(done)
})

describe('Check API access permissions', function () {
  describe('GET /api/repo', function () {
    it('Get repositories only for authenticated users', function (done) {
      request(server)
        .get('/api/repo')
        .then(function (res) {
          throw new Error('GET /api/repo is public accessible.')
        })
        .catch(function (err) {
          expect(err).to.have.status(401)
          done()
        })
    })
  })

  describe('POST /api/repo', function () {
    it('Add repositories only for authenticated users', function (done) {
      request(server)
        .post('/api/repo')
        .send(repos[0])
        .then(function (res) {
          throw new Error('POST /api/repo is public accessible.')
        })
        .catch(function (err) {
          expect(err).to.have.status(401)
          done()
        })
    })
  })
})

describe('Create Account, Login and Check Token', function () {
  before(function (done) {
    User.remove({}).then(() => done()).catch((error) => done(error))
  })

  describe('POST /signup', function () {
    it('Register user account', function (done) {
      request(server)
        .post('/signup')
        .send(users[0])
        .then(function (res) {
          expect(res).to.have.status(201)
          done()
        })
        .catch(function (err) {
          done(err)
        })
    })
  })

  describe('POST /signin', function () {
    it('Login with user account and retrieve token', function (done) {
      request(server)
        .post('/signin')
        .send(users[0])
        .then(function (res) {
          expect(res).to.have.status(200)
          expect(res.body).to.have.property('token')

          const token = res.body.token

          request(server)
            .get('/api/repo')
            .set('x-access-token', token)
            .then(function (res) {
              expect(res).to.have.status(200)
              done()
            })
            .catch(function (err) {
              done(err)
            })
        })
        .catch(function (err) {
          done(err)
        })
    })
  })
})

describe('Add and get repository', function () {
  before(function (done) {
    Repo.remove({}).then(() => done()).catch((error) => done(error))
  })

  beforeEach(function (done) {
    this.timeout(20000)
    setTimeout(done, 5000)
  })

  let token
  let repositoryId

  describe('POST /api/repo', function () {
    it('Add a repository', function (done) {
      User
        .findOne({'email': 'johndoe@acme.com'})
        .then((user) => {
          token = jwt.sign({
            _id: user._id,
            email: user.email,
            username: user.username
          }, conf.get('api.credentials.secret'))

          request(server)
            .post('/api/repo')
            .set('x-access-token', token)
            .send(repos[0])
            .then(function (res) {
              expect(res).to.have.status(200)
              expect(res).to.be.json
              done()
            })
            .catch(function (err) {
              done(err)
            })
        })
    })
  })

  describe('GET /api/repo', function () {
    it('Fetch repository entry', function (done) {
      request(server)
        .get('/api/repo')
        .set('x-access-token', token)
        .then(function (res) {
          expect(res).to.have.status(200)
          expect(res).to.be.json
          expect(res.body[0]).to.be.an('object').that.is.not.empty
          repositoryId = res.body[0]._id
          done()
        })
        .catch(function (err) {
          done(err)
        })
    })
  })

  describe('GET /api/repo/:id', function () {
    it('Fetch added repository', function (done) {
      request(server)
        .get('/api/repo/' + repositoryId)
        .set('x-access-token', token)
        .then(function (res) {
          expect(res).to.have.status(200)
          expect(res).to.be.json
          done()
        })
        .catch(function (err) {
          done(err)
        })
    })
  })

  after(function (done) {
    GitManager
      .delete(repos[0].name)
      .then(() => done())
      .catch(done)
  })
})
