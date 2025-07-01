<template>
  <div class="club-list-container">
    <el-card>
      <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 20px; font-weight: bold;">社团列表</span>
        <el-button
          v-if="userStore.role === 'ADMIN' || userStore.role === 'LEADER'"
          type="primary"
          @click="openCreateDialog"
        >新建社团</el-button>
      </div>
      <el-table :data="clubs" style="width: 100%" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="社团名称" />
        <el-table-column prop="description" label="简介" />
        <el-table-column prop="leaderId" label="负责人ID" />
        <el-table-column prop="createdAt" label="创建时间">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 16px; text-align: right;">
        <el-pagination
          background
          layout="total, prev, pager, next, jumper"
          :total="total"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
    <el-dialog v-model="showCreateDialog" title="新建社团" width="400px">
      <el-form :model="createForm" label-width="80px">
        <el-form-item label="社团名称">
          <el-input v-model="createForm.name" autocomplete="off" />
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="createForm.description" autocomplete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" :loading="createLoading" @click="handleCreateClub">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import http from '../config/http'
import { useUserStore } from '../stores/user'

const clubs = ref<any[]>([])
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)
const loading = ref(false)

const userStore = useUserStore()
const showCreateDialog = ref(false)
const createForm = ref({
  name: '',
  description: ''
})
const createLoading = ref(false)

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  return dateStr.replace('T', ' ')
}

async function fetchClubs() {
  loading.value = true
  try {
    const res = await http.get('/clubs', {
      params: {
        page: currentPage.value,
        size: pageSize.value
      }
    })
    // 适配后端返回 { code: 0, data: { list: [], total: 3 } }
    clubs.value = res.data.list
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

function handlePageChange(page: number) {
  currentPage.value = page
  fetchClubs()
}

function openCreateDialog() {
  createForm.value = { name: '', description: '' }
  showCreateDialog.value = true
}

async function handleCreateClub() {
  createLoading.value = true
  try {
    await http.post('/clubs', {
      name: createForm.value.name,
      description: createForm.value.description,
      leaderId: userStore.userId
    })
    showCreateDialog.value = false
    fetchClubs()
  } finally {
    createLoading.value = false
  }
}

onMounted(() => {
  fetchClubs()
})
</script>

<style scoped>
.club-list-container {
  max-width: 900px;
  margin: 40px auto;
}
</style> 