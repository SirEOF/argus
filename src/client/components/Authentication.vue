<template>
    <div class="login-page">
      <div class="form">
        <img src="../assets/images/favicon.png">
        <form class="register-form" v-on:submit.prevent="doSignup" v-if="!showLogin">
          <input id="username" v-model="signupUser.username" type="text" placeholder="Username"/>
          <input id="password" v-model="signupUser.password" type="password" placeholder="Password"/>
          <input id="email" v-model="signupUser.email" type="text" placeholder="@"/>
          <button type="submit">signup</button>
          <p class="message">
            Already registered? <a @click="showLogin = true">Sign In</a>
          </p>
        </form>
        <form class="login-form" v-on:submit.prevent="doSignin" v-if="showLogin">
          <input id="email" v-model="signinUser.email" type="text" placeholder="@"/>
          <input id="password" v-model="signinUser.password" type="password" placeholder="Password"/>
          <button type="submit">login</button>
          <p class="message">
            Not registered? <a @click="showLogin = !showLogin">Create an account!</a>
          </p>
        </form>
      </div>
    </div>
</template>

<script>
import Auth from '../lib/auth'

export default {
  name: "Authentication",
  data () {
    return {
      signupUser: {
        username: null,
        email: null,
        password: null,
      },
      signinUser: {
        email: null,
        password: null
      },
      showLogin: true
    }
  },
  methods: {
    doSignup: function () {
      Auth
        .signup(this.signupUser)
        .then((response) => {
          this.showLogin = true
          this.$router.push('/')
        })
        .catch((error) => {
        })
    },
    doSignin: function () {
      Auth
        .signin(this.signinUser)
        .then((response) => {
          Auth.setUserAccessToken(this.signinUser.email, response.data['token'])
          this.$router.push('/')
        })
        .catch((error) => {
        })
    }
  }
}
</script>

<style>
@import url(https://fonts.googleapis.com/css?family=Roboto:300);

.login-page {
  width: 360px;
  padding: 10% 0 0;
  margin: auto;
}
.form {
  position: relative;
  z-index: 1;
  background: #33334d;
  max-width: 360px;
  margin: 0 auto 100px;
  padding: 20px 45px 20px 45px;
  text-align: center;
  box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.24);
}
.form img {
  padding: 0px 0px 30px 0px;
}
.form input {
  font-family: "Roboto", sans-serif;
  outline: 0;
  background: #666699;
  width: 100%;
  border: 0;
  margin: 0 0 15px;
  padding: 15px;
  box-sizing: border-box;
  font-size: 13px;
}
.form button {
  font-family: "Roboto", sans-serif;
  text-transform: uppercase;
  outline: 0;
  background: #4CAF50;
  width: 100%;
  border: 0;
  padding: 15px;
  color: #FFFFFF;
  font-size: 14px;
  -webkit-transition: all 0.3 ease;
  transition: all 0.3 ease;
  cursor: pointer;
}
.form button:hover, .form button:active, .form button:focus {
  background: #43A047;
}
.form .message {
  margin: 15px 0 0;
  color: #b3b3b3;
  font-size: 12px;
}
.form .message a {
  color: #4CAF50;
  text-decoration: none;
}

body {
  background: -webkit-linear-gradient(right, #33334d, #1f1f2e);
  background: -moz-linear-gradient(right, #33334d, #1f1f2e);
  background: -o-linear-gradient(right, #33334d, #1f1f2e);
  background: linear-gradient(to left, #33334d, #1f1f2e);
  font-family: "Roboto", sans-serif;
}
</style>
