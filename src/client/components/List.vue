<template>
  <div>
    <el-table
      :data="tableData"
      :default-sort="{prop: 'updated', order: 'descending'}"
      style="width: 100%">
      <el-table-column type="expand">
        <template slot-scope="props">
          <p>Id: {{ props.row._id }}</p>
          <p>Remote: <a :href="props.row.remote">{{ props.row.remote }}</a></p>
          <p>Head: {{ props.row.head }}</a></p>
        </template>
      </el-table-column>

      <el-table-column prop="name" label="Name" width="130">
        <template slot-scope="scope">
          <el-popover trigger="hover" placement="right">
            <p>Branch: {{ scope.row.branch }}</p>
            <p>Remote: <a :href="scope.row.remote">{{ scope.row.remote }}</a></p>
            <div slot="reference" class="name-wrapper">
              <router-link :to="'/commits/' + scope.row._id">
                <el-tag size="medium">{{ scope.row.name }}</el-tag>
              </router-link>
            </div>
          </el-popover>
        </template>
      </el-table-column>

      <el-table-column prop="branch" label="Branch" width="120">
        <template slot-scope="scope">
          {{ scope.row.branch }}
        </template>
      </el-table-column>

      <el-table-column prop="commits" label="Commits" width="110">
        <template slot-scope="scope">
          {{ scope.row.commits }}
        </template>
      </el-table-column>

      <el-table-column prop="status" label="Status" width="100" sortable :format="formatter">
      </el-table-column>

      <el-table-column prop="updated" label="Updated" width="150" sortable>
        <template slot-scope="scope">
          {{ scope.row.updated | formatDate}}
        </template>
      </el-table-column>

      <el-table-column label="Operations">
        <template slot-scope="scope">
          <el-button
            size="mini"
            @click="handleForceUpdate(scope.$index, scope.row)">
            Force Update
          </el-button>
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(scope.$index, scope.row)">
            Delete
          </el-button>
        </template>
      </el-table-column>

    </el-table>
  </div>
</template>

<script>
import axios from 'axios'
import Auth from '../lib/auth'

export default {
  name: "List",
  data () {
    return {
      tableData: [{}]
    }
  },
  methods: {
    handleDelete(index, row) {
      this.$confirm('This will permanently delete the repository. Continue?', 'Warning', {
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            type: 'warning'
          }).then(() => {
            axios.delete('/api/v1/repo/' + row._id, {
              headers: {
                'Content-Type': 'application/json',
                'x-access-token': Auth.getUserAccessToken()
              }}
            ).then((response) => {
              this.$message({
                type: 'success',
                message: 'Delete completed'
              });
            }).catch((error) => {
              console.log(error)
            })
          }).catch(() => {
            this.$message({
              type: 'info',
              message: 'Delete canceled'
            });
          });
    },
    handleForceUpdate(index, row) {
      axios.put('/api/v1/repo/' + row._id, null, {
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': Auth.getUserAccessToken()
        }}
      ).then((response) => {
        console.log(response)
      }).catch((error) => {
        console.log(error)
      })
    },
    formatter(row, column) {
      if (row.status) {
        return row.status[0]
      }
    },
    setStatus(x) {
      if (x) {
        switch (x[0]) {
          case 'active':
            return 'success'
          case 'failed':
            return 'danger'
          case 'pending':
            return 'warning'
          case 'inactive':
          case 'queued':
            return 'info'
        }
      }
    }
  },
  created () {
    axios.get('/api/v1/repo/', {
        headers: {
          'x-access-token': Auth.getUserAccessToken(),
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then((response) => {
        this.tableData = response.data
      })
  }
}
</script>

<style>
span.status {
    background-color: green;
    display: block;
    height: 8px;
    width: 8px;
    border-radius: 4px;
}

.green { background-color: green }
.red { background-color: red; }
.yellow { background-color: yellow }
</style>
