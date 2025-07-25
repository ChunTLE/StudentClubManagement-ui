<template>
  <div class="activity-list-container">
    <el-card>
      <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 20px; font-weight: bold;">活动列表</span>
        <el-button v-if="userStore.role === 'ADMIN' || userStore.role === 'LEADER'" type="primary"
          @click="openCreateDialog">新建活动</el-button>
      </div>
      <div style="margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
        <el-input v-model="searchTitle" placeholder="输入活动名称" style="width: 200px;" />
        <el-button type="primary" @click="handleSearchActivity">查询活动</el-button>
        <el-button v-if="userStore.role === 'ADMIN' || userStore.role === 'LEADER'" @click="exportActivities"
          type="success">导出数据</el-button>
      </div>
      <el-table :data="activities" style="width: 100%" v-loading="loading" border :stripe="true">
        <el-table-column prop="title" label="活动名称" />
        <el-table-column prop="content" label="简介" width="180" />
        <el-table-column prop="location" label="地点" />
        <el-table-column label="所属社团">
          <template #default="scope">
            {{ clubMap[scope.row.clubId] || scope.row.clubId }}
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="endTime" label="结束时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.endTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <div class="action-btns-horizontal">
              <el-button size="small" v-if="userStore.role === 'ADMIN' || userStore.role === 'LEADER'"
                @click="openEditDialog(scope.row)">修改</el-button>
              <el-button v-if="userStore.role === 'ADMIN'" size="small" type="danger"
                @click="confirmDeleteActivity(scope.row)">删除</el-button>
              <el-button v-if="userStore.role === 'MEMBER' && !enrolledActivityIds.has(scope.row.id)" size="small"
                type="primary" @click="handleEnroll(scope.row)">报名</el-button>
              <el-button v-if="userStore.role === 'MEMBER' && enrolledActivityIds.has(scope.row.id)" size="small"
                type="success" disabled>已报名</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="table-pagination-wrapper">
        <el-pagination background layout="total, prev, pager, next, jumper" :total="total" :page-size="pageSize"
          :current-page="currentPage" @current-change="handlePageChange" />
      </div>
    </el-card>
    <el-dialog v-model="showCreateDialog" title="新建活动" width="500px">
      <el-form :model="createForm" label-width="100px">
        <el-form-item label="活动名称">
          <el-input v-model="createForm.title" autocomplete="off" />
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="createForm.content" autocomplete="off" />
        </el-form-item>
        <el-form-item label="地点">
          <el-input v-model="createForm.location" autocomplete="off" />
        </el-form-item>
        <el-form-item label="所属社团">
          <el-select v-model="createForm.clubId" placeholder="请选择所属社团" style="width: 100%">
            <el-option v-for="club in clubs" :key="club.id" :label="club.name" :value="club.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker v-model="createForm.startTime" type="datetime" placeholder="选择开始时间" style="width: 100%"
            format="YYYY-MM-DDTHH:mm:ss" value-format="YYYY-MM-DDTHH:mm:ss" />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker v-model="createForm.endTime" type="datetime" placeholder="选择结束时间" style="width: 100%"
            format="YYYY-MM-DDTHH:mm:ss" value-format="YYYY-MM-DDTHH:mm:ss" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" :loading="createLoading" @click="handleCreateActivity">确定</el-button>
      </template>
    </el-dialog>
    <el-dialog v-model="showEditDialog" title="修改活动" width="500px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="活动名称">
          <el-input v-model="editForm.title" autocomplete="off" />
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="editForm.content" autocomplete="off" />
        </el-form-item>
        <el-form-item label="地点">
          <el-input v-model="editForm.location" autocomplete="off" />
        </el-form-item>
        <el-form-item label="所属社团">
          <el-select v-model="editForm.clubId" placeholder="请选择所属社团" style="width: 100%">
            <el-option v-for="club in clubs" :key="club.id" :label="club.name" :value="club.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker v-model="editForm.startTime" type="datetime" placeholder="选择开始时间" style="width: 100%"
            format="YYYY-MM-DDTHH:mm:ss" value-format="YYYY-MM-DDTHH:mm:ss" />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker v-model="editForm.endTime" type="datetime" placeholder="选择结束时间" style="width: 100%"
            format="YYYY-MM-DDTHH:mm:ss" value-format="YYYY-MM-DDTHH:mm:ss" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" :loading="editLoading" @click="handleEditActivity">确定</el-button>
      </template>
    </el-dialog>
    <el-dialog v-model="showDeleteDialog" title="删除确认" width="300px">
      <span>确定要删除活动"{{ deleteActivityTitle }}"吗？</span>
      <template #footer>
        <el-button @click="showDeleteDialog = false">取消</el-button>
        <el-button type="danger" :loading="deleteLoading" @click="handleDeleteActivity">删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import http from '../config/http'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'

const activities = ref<any[]>([])
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)
const loading = ref(false)
const searchTitle = ref('')
const userStore = useUserStore()
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const deleteActivityId = ref<number | null>(null)
const deleteActivityTitle = ref('')
const deleteLoading = ref(false)
const enrolledActivityIds = ref<Set<number>>(new Set())

const createForm = ref({
  title: '',
  content: '',
  location: '',
  clubId: '',
  startTime: '',
  endTime: ''
})
const createLoading = ref(false)

const editForm = ref({
  id: null,
  title: '',
  content: '',
  location: '',
  clubId: '',
  startTime: '',
  endTime: ''
})
const editLoading = ref(false)

const clubs = ref<any[]>([])
const clubMap = computed(() => {
  const map: Record<number, string> = {}
  clubs.value.forEach((club: any) => {
    map[club.id] = club.name
  })
  return map
})

async function fetchClubs() {
  // 拉取所有社团
  const res = await http.get('/clubs', { params: { page: 1, size: 1000 } })
  clubs.value = res.data.list || []
}

async function fetchActivities() {
  loading.value = true
  try {
    const res = await http.get('/activities', {
      params: {
        pageNum: currentPage.value,
        pageSize: pageSize.value,
        title: searchTitle.value || undefined
      }
    })
    activities.value = res.data.records || []
    total.value = res.data.total || 0
  } finally {
    loading.value = false
  }
}

function handlePageChange(page: number) {
  currentPage.value = page
  fetchActivities()
}

async function handleSearchActivity() {
  currentPage.value = 1
  fetchActivities()
}

function openCreateDialog() {
  createForm.value = { title: '', content: '', location: '', clubId: '', startTime: '', endTime: '' }
  showCreateDialog.value = true
}

async function handleCreateActivity() {
  createLoading.value = true
  try {
    await http.post('/activities', {
      ...createForm.value,
      createdBy: userStore.userId
    })
    showCreateDialog.value = false
    fetchActivities()
  } finally {
    createLoading.value = false
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  // 兼容T分隔符和无T分隔符
  const d = new Date(dateStr.replace('T', ' ').replace(/-/g, '/'))
  const pad = (n: number) => n < 10 ? '0' + n : n
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function openEditDialog(row: any) {
  editForm.value = { ...row }
  showEditDialog.value = true
}

async function handleEditActivity() {
  editLoading.value = true
  try {
    await http.put(`/activities/${editForm.value.id}`, {
      ...editForm.value,
      createdBy: userStore.userId
    })
    showEditDialog.value = false
    fetchActivities()
  } finally {
    editLoading.value = false
  }
}

function confirmDeleteActivity(row: any) {
  deleteActivityId.value = row.id
  deleteActivityTitle.value = row.title
  showDeleteDialog.value = true
}

async function handleDeleteActivity() {
  if (!deleteActivityId.value) return
  deleteLoading.value = true
  try {
    await http.delete(`/activities/${deleteActivityId.value}`)
    showDeleteDialog.value = false
    fetchActivities()
  } catch (e: any) {
    // 判断外键约束错误
    if (e?.message?.includes('a foreign key constraint fails')) {
      ElMessage.error('该活动下还有报名信息，请先删除所有报名信息后再删除活动！')
    } else {
      ElMessage.error('删除失败')
    }
  } finally {
    deleteLoading.value = false
  }
}

async function sendMessageToUser(userId: number, activityTitle: string) {
  await http.post('/message/send', {
    userId,
    title: '系统通知',
    content: `您已成功报名活动：${activityTitle}`,
    type: '系统'
  })
}

async function fetchEnrolledActivities() {
  if (!userStore.userId) return
  try {
    const res = await http.get(`/activities/user/${userStore.userId}`)
    // 假设返回数组为活动对象或id数组
    const ids = Array.isArray(res.data) ? res.data.map((a: any) => Number(a.id || a)) : []
    enrolledActivityIds.value = new Set(ids)
  } catch (e) {
    enrolledActivityIds.value = new Set()
  }
}

async function handleEnroll(row: any) {
  try {
    await http.post('/enrollments', {
      userId: userStore.userId,
      activityId: row.id
    })
    // 报名成功后发送消息
    await sendMessageToUser(Number(userStore.userId), row.title)
    ElMessage.success('报名成功，已发送通知！')
    // 报名成功后，更新已报名活动id列表
    enrolledActivityIds.value.add(row.id)
  } catch (e: any) {
    // 可以根据需要补充错误提示
  }
}

async function exportActivities() {
  try {
    const res = await http.get('/activities/export', { responseType: 'blob' })
    const blob = res.data; // 直接用 data

    if (blob.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      const text = await blob.text();
      console.error('导出失败，服务器返回：', text);
      ElMessage.error('导出失败，服务器返回错误信息');
      return;
    }

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = '活动数据.xlsx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (e) {
    if (e instanceof Blob) {
      const text = await e.text();
      console.error('导出异常，服务器返回：', text);
      ElMessage.error("导出失败：" + text.slice(0, 100));
    } else {
      console.error('导出异常', e);
      ElMessage.error("导出失败");
    }
  }
}
onMounted(() => {
  fetchActivities()
  fetchClubs()
  fetchEnrolledActivities()
})
</script>

<style scoped>
.activity-list-container {
  max-width: 1200px;
  margin: 40px auto;
  font-size: 18px;
}

.el-card {
  font-size: 18px;
}

.el-table th,
.el-table td {
  font-size: 18px;
}

.table-pagination-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 16px;
  margin-bottom: 0;
}

/* 操作按钮水平排列 */
.action-btns-horizontal {
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
}
</style>