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
      <div v-if="userStore.role === 'ADMIN' || userStore.role === 'LEADER' || userStore.role === 'MEMBER'" style="margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
        <el-input v-model="searchName" placeholder="输入社团名称" style="width: 200px;" />
        <el-button type="primary" @click="handleSearchClub">查询社团</el-button>
      </div>
      <div class="table-with-pagination">
        <div class="table-flex-grow">
          <el-table :data="paginatedClubs" style="width: 100%" v-loading="loading" border>
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="社团名称" />
          <el-table-column prop="description" label="简介" />
          <el-table-column prop="leaderId" label="负责人ID" />
          <el-table-column prop="createdAt" label="创建时间">
            <template #default="scope">
              {{ formatDate(scope.row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" v-if="userStore.role === 'ADMIN' || userStore.role === 'LEADER'">
            <template #default="scope">
              <el-button size="small" @click="openEditDialog(scope.row)">修改</el-button>
              <el-button v-if="userStore.role === 'ADMIN'" size="small" type="danger" @click="confirmDeleteClub(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>  
        </div>
        
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
    <el-dialog v-model="showEditDialog" title="修改社团" width="400px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="社团名称">
          <el-input v-model="editForm.name" autocomplete="off" />
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="editForm.description" autocomplete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" :loading="editLoading" @click="handleEditClub">确定</el-button>
      </template>
    </el-dialog>
    <el-dialog v-model="showDeleteDialog" title="删除确认" width="300px">
      <span>确定要删除社团"{{ deleteClubName }}"?</span>
      <template #footer>
        <el-button @click="showDeleteDialog = false">取消</el-button>
        <el-button type="danger" :loading="deleteLoading" @click="handleDeleteClub">删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import http from '../config/http'
import { useUserStore } from '../stores/user'

const allClubs = ref<any[]>([])
const searchName = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

const userStore = useUserStore()
const showCreateDialog = ref(false)
const createForm = ref({
  name: '',
  description: ''
})
const createLoading = ref(false)

// 编辑相关
const showEditDialog = ref(false)
const editForm = ref({
  id: null,
  name: '',
  description: ''
})
const editLoading = ref(false)

// 删除相关
const showDeleteDialog = ref(false)
const deleteClubId = ref<number|null>(null)
const deleteClubName = ref('')
const deleteLoading = ref(false)

const filteredClubs = computed(() => {
  if (!searchName.value) return allClubs.value
  return allClubs.value.filter((club: any) => club.name && club.name.includes(searchName.value))
})

const paginatedClubs = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredClubs.value.slice(start, end)
})

const total = computed(() => filteredClubs.value.length)

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  return dateStr.replace('T', ' ')
}

async function fetchClubs() {
  loading.value = true
  try {
    const res = await http.get('/clubs', {
      params: {
        page: 1,
        size: 10000 // 拉取所有社团
      }
    })
    allClubs.value = res.data.list
  } finally {
    loading.value = false
  }
}

function handlePageChange(page: number) {
  currentPage.value = page
}

function handleSearchClub() {
  currentPage.value = 1
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

function openEditDialog(row: any) {
  editForm.value = { ...row }
  showEditDialog.value = true
}

async function handleEditClub() {
  editLoading.value = true
  try {
    await http.put(`/clubs/${editForm.value.id}`, {
      name: editForm.value.name,
      description: editForm.value.description,
      leaderId: userStore.userId
    })
    showEditDialog.value = false
    fetchClubs()
  } finally {
    editLoading.value = false
  }
}

function confirmDeleteClub(row: any) {
  deleteClubId.value = row.id
  deleteClubName.value = row.name
  showDeleteDialog.value = true
}

async function handleDeleteClub() {
  if (!deleteClubId.value) return
  deleteLoading.value = true
  try {
    await http.delete(`/clubs/${deleteClubId.value}`)
    showDeleteDialog.value = false
    fetchClubs()
  } finally {
    deleteLoading.value = false
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

/* 固定分页在表格下方居中 */
.table-pagination-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 16px;
  margin-bottom: 0;
}

/* 保证分页始终在表格底部 */
.table-with-pagination {
  min-height: 500px; /* 可根据实际表格高度调整 */
  display: flex;
  flex-direction: column;
}
.table-flex-grow {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
   /* 可根据实际需求调整 */
}
</style> 