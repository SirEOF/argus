<template>
  <div id="Dashboard">
    <AppNavigation/>
    <router-view/>
    <AppFooter/>
  </div>
</template>

<script>
import AppNavigation from './AppNavigation'
import AppFooter from './AppFooter.vue'

export default {
  name: 'Dashboard',
  components: {
    AppNavigation,
    AppFooter
  }
}
</script>

<style>
@font-face {
  font-family: 'Karla';
  font-style: normal;
  font-weight: 300;
  src: url('../assets/fonts/Karla-Regular.ttf') format('truetype')
}

html {
  /* for sticky footer */
  position: relative;
  min-height: 100%;
}

body {
  font-family: 'Karla';
  width: 100%;
  height: 100%;
  margin: 0;
  background-color: #fff;
  margin-bottom: 100px;
  font-size: 13px;
}

a {
  text-decoration: none;
  color: #333;
}

a:hover {
  text-decoration: underline;
}

a:visited {
  color: #333;
  text-decoration: none;
}
</style>
