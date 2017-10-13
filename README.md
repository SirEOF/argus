![Logo](https://github.com/posidron/posidron.github.io/raw/master/static/images/argus.png)

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Build Status](https://api.travis-ci.org/MozillaSecurity/argus.svg?branch=master)](https://travis-ci.org/MozillaSecurity/argus) [![Known Vulnerabilities](https://snyk.io/test/github/mozillasecurity/argus/badge.svg)](https://snyk.io/test/github/mozillasecurity/argus)
[![Coverage Status](https://coveralls.io/repos/github/MozillaSecurity/argus/badge.svg?branch=master)](https://coveralls.io/github/MozillaSecurity/argus?branch=master) [![IRC](https://img.shields.io/badge/IRC-%23fuzzing-1e72ff.svg?style=flat)](https://www.irccloud.com/invite?channel=%23fuzzing&amp;hostname=irc.mozilla.org&amp;port=6697&amp;ssl=1)


### Prerequisites

[Redis](https://redis.io/download) and
[MongoDB](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/#install-mongodb-community-edition) are required.

```bash
brew install redis mongodb
```

### Setup Prerequisites

```bash
redis-sever
mongodb --dbpath=/tmp/
```

### Setup
```bash
npm install
```

### Development

```bash
npm run development
```

### API

| Type   | Path           | Description                |
| -------|:---------------| :--------------------------|
| GET    | /signup        | Register                   |
| POST   | /signin        | Retrieving the JWT         |
| GET    | /api/repos/    | Get a list of repositories |
| POST   | /api/repos     | Add a repository           |
| GET    | /api/repos/:id | Get commits                |
| DELETE | /api/repos/:id | Delete a repository        |
| PUT    | /api/repos/:id | Force pulling a repository |


The ```x-access-token``` header needs to be set in order to make a request to any API path. The JWT token can be obtained during the ```signin``` process.

### Testing and Coverage

```bash
npm test
```

**NOTE:** Before each commit ```npm test``` is run to prevent any potentially test failure and style issues from being accidentally pushed.

Tests are written with the assertion library [ChaiJS](http://chaijs.com/api/bdd) running with the [MochaJS](https://mochajs.org) test framework.

```bash
npm run coverage
```
