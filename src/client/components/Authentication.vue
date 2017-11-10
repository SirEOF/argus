<template>
  <div class="form">
    <img src="../assets/images/favicon.png">

    <div v-show="!showLogin">
      <el-form
        status-icon
        :model="signupForm"
        :rules="signupRules"
        ref="signupForm"
        class="signupForm">

        <el-form-item prop="username">
          <el-input
            key="signup_username"
            prefix-icon="fa fa-user"
            placeholder="Username"
            v-model="signupForm.username">
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            key="signup_password"
            prefix-icon="fa fa-key"
            placeholder="Password"
            type="password"
            v-model="signupForm.password">
          </el-input>
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input
            key="signup_confirm_password"
            prefix-icon="fa fa-key"
            placeholder="Confirm Password"
            type="password"
            v-model="signupForm.confirmPassword">
          </el-input>
        </el-form-item>

        <el-form-item prop="email">
          <el-input
            key="signup_email"
            prefix-icon="fa fa-envelope-o"
            placeholder="Email"
            v-model="signupForm.email">
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="doSignup('signupForm')">signup</el-button>
        </el-form-item>

        <p class="message">
          Already registered? <a @click="hide('signupForm')">Sign In</a>
        </p>
      </el-form>
    </div>

    <div v-show="showLogin">
      <el-form
        status-icon
        :model="signinForm"
        :rules="signinRules"
        ref="signinForm"
        class="signinForm">

        <el-form-item prop="email">
          <el-input
            key="signin_email"
            prefix-icon="fa fa-envelope-o"
            placeholder="Email"
            v-model="signinForm.email">
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            key="signin_password"
            prefix-icon="fa fa-key"
            placeholder="Password"
            type="password"
            v-model="signinForm.password">
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="doSignin('signinForm')">signin</el-button>
        </el-form-item>

        <p class="message">
          Not registered? <a @click="hide('signinForm')">Create an account!</a>
        </p>
      </el-form>
    </div>

  </div>
</template>

<script>
import Auth from '../lib/auth'

export default {
  name: "Authentication",
  data() {
    return {
      showLogin: true,
      signupForm: {
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      signinForm: {
        email: null,
        password: null
      },
      signupRules: {
        username: [{
          required: true,
          message: 'A username is required.',
          trigger: 'blur'
        },
        {
          min: 5,
          max: 24,
          message: 'Username must be between 5 and 24 characters.',
          trigger: 'blur'
        }],
        email: [{
          required: true,
          type: 'email',
          message: 'An email is required.',
          trigger: 'blur'
        }],
        password: [{
          validator: this.validatePassword,
          trigger: 'blur'
        }],
        confirmPassword: [{
          validator: this.confirmPassword,
          trigger: 'blur'
        }],
      },
      signinRules: {
        email: [{
          required: true,
          type: 'email',
          message: 'An email is required.',
          trigger: 'blur'
        }],
        password: [{
          required: true,
          message: 'A password is required.',
          trigger: 'blur'
        }]
      }
    }
  },
  methods: {
    hide (formName) {
      this.$refs[formName].resetFields()
      this.$refs[formName].clearValidate()
      this.showLogin = !this.showLogin
    },
    validatePassword (rule, value, callback) {
      if (value === '') {
        callback(new Error('A password is required.'))
      } else if (!value.match(/^(?=.*[\d])(?=.*[!@#$%^&*])[\w!@#$%^&*]/)) {
        callback(new Error('Add numbers and non-alphanumeric characters.'))
      } else if (value.length < 12 || value.length > 32)  {
        callback(new Error('Must be at least 12 - 32 characters.'))
      } else {
        callback()
      }
    },
    confirmPassword (rule, value, callback) {
      if (value === '') {
        callback(new Error('Confirm your password.'))
      } else if (value !== this.signupForm.password) {
        callback(new Error('Passwords do not match!'))
      } else {
        callback()
      }
    },
    doSignup (formName) {
      this.$refs[formName].validate()
        .then((valid) => {
          Auth
            .signup(this.signupForm)
            .then((response) => {
              this.$message({
                type: 'success', message: 'Account created successfully.'
              });
              this.showLogin = true
              this.$router.push('/')
            })
            .catch((error) => {
              this.$message({
                type: 'error', message: 'Sorry. You can not create this account.'
              });
            })
      })
      .catch((error) => { })
    },
    doSignin (formName) {
      this.$refs[formName].validate()
        .then((valid) => {
          Auth
            .signin(this.signinForm)
            .then((response) => {
              Auth.setUserAccessToken(this.signinForm.email, response.data['token'])
              this.$message({
                type: 'success', message: `Welcome back ${this.signinForm.email}`
              });
              this.$router.push('/')
            })
            .catch((error) => {
              this.$message({
                type: 'error', message: 'Your credentials are incorrect.'
              });
            })
      })
      .catch((error) => { })
    }
  }
}
</script>

<style scope>
@font-face {
  font-family: 'Karla';
  font-style: normal;
  font-weight: 300;
  src: url('../assets/fonts/Karla-Regular.ttf') format('truetype')
}

body {
  background-color: #213451;
  font-family: "Karla";
}

.form {
  margin: auto;
  position: relative;
  z-index: 1;
  background: #152032;
  width: 270px;
  margin: 10% auto 100px;
  padding: 20px 40px 20px 40px;
  text-align: center;
  box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.24);
}

.form img {
  padding: 0px 0px 30px 0px;
}

.form input {
  font-size: 13px;
  font-family: "Karla";
  color: #cccccc;
  background: #426DB1;
  border-color: #426DB1;
}

.form button {
  font-family: "Karla";
  text-transform: uppercase;
  background: #4CAF50;
  width: 100%;
  border: 0;
  padding: 15px;
  color: #ffffff;
  font-size: 14px;
}

.form button:hover,
.form button:active,
.form button:focus {
  background: #43A047;
}

.form .message {
  margin: 15px 0 0;
  color: #b3b3b3;
  font-size: 12px;
}

.form .message a {
  color: #4CAF50;
  cursor: pointer;
}
</style>
