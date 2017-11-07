import Vue from 'vue'
import VueRouter from 'vue-router'

import Auth from '../lib/auth'

import NotFound from '../components/errors/404'
import Dashboard from '../components/Dashboard'
import Authentication from '../components/Authentication'
import List from '../components/List'
import Add from '../components/Add'
import Commits from '../components/Commits'

Vue.use(VueRouter)

const router = new VueRouter({
  saveScrollPosition: true,
  routes: [
    {
      name: 'Authentication',
      path: '/auth',
      component: Authentication
    },
    {
      path: '/',
      name: 'Dashboard',
      component: Dashboard,
      children: [
        {
          name: 'List',
          path: 'list',
          component: List
        },
        {
          name: 'Add',
          path: 'add',
          component: Add
        },
        {
          name: 'Commits',
          path: '/commits/:id',
          component: Commits
        }
      ]
    },
    {
      path: '*',
      component: NotFound
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.path !== '/auth') {
    if (!Auth.isSignedIn()) {
      next({
        path: '/auth',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
