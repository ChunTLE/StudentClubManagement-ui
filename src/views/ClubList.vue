<template>
  <div class="club-list-container">
    <el-card>
      <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 20px; font-weight: bold;">社团列表</span>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import http from '../config/http'

const clubs = ref<any[]>([])
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)
const loading = ref(false)

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