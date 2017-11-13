<template>
  <div class="container">
    <el-menu :default-active="activeIndex"
             class="el-menu"
             mode="horizontal"
             background-color="#545c64"
             text-color="#fff"
             active-text-color="#ffd04b"
             router>
      <el-menu-item index="1" :route="{name:'Dashboard'}">Argus</el-menu-item>
      <el-menu-item index="2" :route="{name:'List'}">Observation</el-menu-item>
      <el-menu-item index="3" :route="{name:'Add'}">Add</el-menu-item>
      <el-submenu index="4" style="float: right;">
        <template slot="title">
          <i class="fa fa-user-secret"></i> <em>{{ user }}</em>
        </template>
        <el-menu-item index="4-1" @click="signout()">
          <i class="fa fa-sign-out"></i> Sign-out
        </el-menu-item>
      </el-submenu>
    </el-menu>
  </div>
</template>

<script>
import Auth from '../lib/auth'

export default {
  name: 'AppNavigation',
  data () {
    return {
      brand: 'Argus',
      user: Auth.getUserAccount(),
      activeIndex: '1',
    }
  },
  methods: {
    signout () {
      Auth.signout()
    }
  }
}
</script>

<style>
.logo-container {
    text-align: center;
    width: 10%;
    padding-top: 5px;
}
.logo {
    width: 50px;
    height: 50px;
}
</style>
