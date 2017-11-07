import axios from 'axios'
import Router from 'vue-router'

const router = new Router()

function signup (data) {
  return axios.post('/signup', data, {
    'Content-Type': 'application/x-www-form-urlencoded'
  })
}

function signin (data) {
  return axios.post('/signin', data, {
    'Content-Type': 'application/x-www-form-urlencoded'
  })
}

function signout () {
  clearUserAccessToken()
  router.go('/')
}

function setUserAccessToken (email, accessToken) {
  localStorage.setItem('UserAccount', email)
  localStorage.setItem('UserAccessToken', accessToken)
}

function getUserAccessToken () {
  return localStorage.getItem('UserAccessToken')
}

function getUserAccount () {
  return localStorage.getItem('UserAccount')
}

function clearUserAccessToken () {
  localStorage.removeItem('UserAccount')
  localStorage.removeItem('UserAccessToken')
}

function isSignedIn () {
  return !!getUserAccessToken()
}

export default {
  signup,
  signin,
  signout,
  getUserAccount,
  isSignedIn,
  setUserAccessToken,
  getUserAccessToken
}
