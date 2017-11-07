import Vue from 'vue'
import moment from 'moment'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import 'font-awesome/css/font-awesome.css'

import router from './router'

import App from './components/App'

Vue.config.debug = true
Vue.config.productionTip = false

// Register custom filters for interpolation in Vue.
Vue.filter('formatDate', function(value) {
  if (value) {
    return moment(String(value)).format('MM/DD/YYYY hh:mm')
  }
})

Vue.use(ElementUI)

/* eslint-disable no-new */
new Vue({
  el: '#EntryPoint',
  router,
  render (createElement) {
    return createElement(App)
  }
})
