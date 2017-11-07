<template>
  <div class="container">
    <div class="elem-form-container">
      <el-form
        :model="ruleForm"
        :rules="rules"
        size="medium"
        label-position="top"
        status-icon
        ref="ruleForm"
        label-width="20px"
        class="ruleForm elem-form-content">

        <el-row :gutter="20">
          <el-col :span="18">
            <el-form-item label="Remote URL" prop="remote" required>
              <el-input v-model="ruleForm.remote" auto-complete="on" placeholder="http://">
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Name" prop="name" required>
              <el-input v-model="ruleForm.name" autofocus auto-complete="on">
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="10">
            <el-form-item label="Branch" prop="branch">
              <el-input disabled v-model="ruleForm.branch" placeholder="master">
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item>
          <el-button type="primary" icon="el-icon-upload" @click="submitForm('ruleForm')">
            Add
          </el-button>
          <el-button icon="el-icon-circle-close-outline" @click="resetForm('ruleForm')">
            Reset
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Auth from '../lib/auth'

export default {
  name: "Add",
  data () {
    return {
      ruleForm: {
        remote: '',
        branch: '',
        name: ''
      },
      rules: {
        name: [
          {
            required: true,
            message: 'Provide a unique name for this repository.',
            trigger: 'blur'
          },
        ],
        remote: [
          {
            required: true,
            message: 'You must provide a remote URL to the repository.',
            trigger: 'blur'
          },
        ],
        branch: [
          {
            required: false,
            message: 'The default branch is "master".',
            trigger: 'blur'
          },
        ]
      }
    }
  },
  methods: {
    add_repository (data) {
      console.log(Auth.getUserAccessToken())
      axios.post('/api/v1/repo/', data, {
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': Auth.getUserAccessToken()
        }})
        .then((response) => {
          this.$router.push('/list')
        })
        .catch((error) => {
          console.log(error)
        })
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.add_repository({
            'name': this.ruleForm.name,
            'remote': this.ruleForm.remote
          })
        } else {
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    }
  }
}
</script>

<style>
.elem-form-content {
  width: 500px;
}

.elem-form-container {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
