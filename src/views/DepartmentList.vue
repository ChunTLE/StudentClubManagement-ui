<template>
  <div class="department-list-container">
    <el-card>
      <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 20px; font-weight: bold;">部门列表</span>
        <el-button
          v-if="userStore.role === 'ADMIN' || userStore.role === 'LEADER'"
          type="primary"
          @click="openCreateDialog"
        >新建部门</el-button>
      </div>
      <div style="margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
        <el-input v-model="searchName" placeholder="输入部门名称" style="width: 200px;" />
      </div>
      <el-table :data="paginatedDepartments" style="width: 100%" v-loading="loading" border>
        <el-table-column prop="name" label="部门名称" />
        <el-table-column prop="description" label="简介" />
        <el-table-column label="所属社团">
          <template #default="scope">
            {{ clubMap[scope.row.clubId] || scope.row.clubId }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" v-if="userStore.role === 'ADMIN' || userStore.role === 'LEADER' || userStore.role === 'MEMBER'" width="200">
          <template #default="scope">
            <div class="action-btns-horizontal">
              <el-button v-if ="userStore.role === 'ADMIN' || userStore.role === 'LEADER'" size="small" @click="openEditDialog(scope.row)">修改</el-button>
              <el-button v-if="userStore.role === 'ADMIN'" size="small" type="danger" @click="confirmDeleteDepartment(scope.row)">删除</el-button>
              <el-button v-if ="userStore.role === 'MEMBER'" size="small" type="primary" @click="handleJoinDepartment(scope.row)">报名</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="table-pagination-wrapper">
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
    <el-dialog v-model="showCreateDialog" title="新建部门" width="400px">
      <el-form :model="createForm" label-width="80px">
        <el-form-item label="部门名称">
          <el-input v-model="createForm.name" autocomplete="off" />
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="createForm.description" autocomplete="off" />
        </el-form-item>
        <el-form-item label="所属社团">
          <el-select v-model="createForm.clubId" placeholder="请选择所属社团" style="width: 100%">
            <el-option
              v-for="club in clubs"
              :key="club.id"
              :label="club.name"
              :value="club.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" :loading="createLoading" @click="handleCreateDepartment">确定</el-button>
      </template>
    </el-dialog>
    <el-dialog v-model="showEditDialog" title="修改部门" width="400px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="部门名称">
          <el-input v-model="editForm.name" autocomplete="off" />
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="editForm.description" autocomplete="off" />
        </el-form-item>
        <el-form-item label="所属社团">
          <el-select v-model="editForm.clubId" placeholder="请选择所属社团" style="width: 100%">
            <el-option
              v-for="club in clubs"
              :key="club.id"
              :label="club.name"
              :value="club.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" :loading="editLoading" @click="handleEditDepartment">确定</el-button>
      </template>
    </el-dialog>
    <el-dialog v-model="showDeleteDialog" title="删除确认" width="300px">
      <span>确定要删除部门"{{ deleteDepartmentName }}"吗？</span>
      <template #footer>
        <el-button @click="showDeleteDialog = false">取消</el-button>
        <el-button type="danger" :loading="deleteLoading" @click="handleDeleteDepartment">删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import http from '../config/http'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'

const departments = ref<any[]>([])
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)
const loading = ref(false)
const clubs = ref<any[]>([])
const clubMap = computed(() => {
  const map: Record<number, string> = {}
  clubs.value.forEach((club: any) => {
    map[club.id] = club.name
  })
  return map
})

const searchName = ref('')
const filteredDepartments = computed(() => {
  if (!searchName.value) return departments.value
  return (departments.value || []).filter((dep: any) => dep.name && dep.name.includes(searchName.value))
})
const paginatedDepartments = computed(() => {
  const arr = filteredDepartments.value || []
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return arr.slice(start, end)
})

const userStore = useUserStore()
const showCreateDialog = ref(false)
const createForm = ref({
  name: '',
  description: '',
  clubId: ''
})
const createLoading = ref(false)
const showEditDialog = ref(false)
const editForm = ref({
  id: null,
  name: '',
  description: '',
  clubId: ''
})
const editLoading = ref(false)
const showDeleteDialog = ref(false)
const deleteDepartmentId = ref<number|null>(null)
const deleteDepartmentName = ref('')
const deleteLoading = ref(false)

async function fetchDepartments() {
  loading.value = true
  try {
    const res = await http.get('/departments', {
      params: {
        pageNum: currentPage.value,
        pageSize: pageSize.value
      }
    })
    departments.value = res.data.records
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

async function fetchClubs() {
  const res = await http.get('/clubs', { params: { page: 1, size: 1000 } })
  clubs.value = res.data.list || []
}

function handlePageChange(page: number) {
  currentPage.value = page
  fetchDepartments()
}

function openCreateDialog() {
  createForm.value = { name: '', description: '', clubId: '' }
  showCreateDialog.value = true
}

async function handleCreateDepartment() {
  createLoading.value = true
  try {
    await http.post('/departments', {
      ...createForm.value
    })
    showCreateDialog.value = false
    fetchDepartments()
  } finally {
    createLoading.value = false
  }
}

function openEditDialog(row: any) {
  editForm.value = { ...row }
  showEditDialog.value = true
}

async function handleEditDepartment() {
  editLoading.value = true
  try {
    await http.put(`/departments/${editForm.value.id}`, {
      ...editForm.value
    })
    showEditDialog.value = false
    fetchDepartments()
  } finally {
    editLoading.value = false
  }
}

function confirmDeleteDepartment(row: any) {
  deleteDepartmentId.value = row.id
  deleteDepartmentName.value = row.name
  showDeleteDialog.value = true
}

async function handleDeleteDepartment() {
  if (!deleteDepartmentId.value) return
  deleteLoading.value = true
  try {
    await http.delete(`/departments/${deleteDepartmentId.value}`)
    showDeleteDialog.value = false
    fetchDepartments()
  } catch (e: any) {
    console.error('删除部门失败', e)
    ElMessage.error(e?.message || '删除部门失败')
  } finally {
    deleteLoading.value = false
  }
}

async function handleJoinDepartment(row: any) {
  try {
    await http.post('/memberships/join', null, {
    params: {
      userId: userStore.userId,
      clubId: row.clubId,
      departmentId: row.id,
      position: '成员'
    }
  })
    ElMessage.success('报名成功！')
    fetchDepartments()
  } catch (e: any) {

  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  // 兼容T分隔符和无T分隔符
  const d = new Date(dateStr.replace('T', ' ').replace(/-/g, '/'))
  const pad = (n: number) => n < 10 ? '0' + n : n
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

onMounted(() => {
  fetchDepartments()
  fetchClubs()
})
</script>

<style scoped>
.department-list-container {
  max-width: 900px;
  margin: 40px auto;
}
.table-pagination-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 16px;
  margin-bottom: 0;
}
.action-btns-horizontal {
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
}
</style>