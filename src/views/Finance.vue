<template>
  <div class="finance-list-container">
    <el-card>
      <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 20px; font-weight: bold;">财政管理</span>
        <el-button
          v-if="userStore.role === 'ADMIN' || userStore.role === 'LEADER'"
          type="primary"
          @click="openCreateDialog"
        >新增记录</el-button>
      </div>
      <div v-if="userStore.role === 'ADMIN' || userStore.role === 'LEADER' || userStore.role === 'MEMBER'" style="margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
        <el-select v-model="searchClubId" placeholder="筛选社团" style="width: 150px;">
          <el-option label="全部社团" value="" />
          <el-option v-for="club in allClubs" :key="club.id" :label="club.name" :value="club.id" />
        </el-select>
        <el-select v-model="searchType" placeholder="类型" style="width: 120px;">
          <el-option label="全部" value="" />
          <el-option label="收入" value="INCOME" />
          <el-option label="支出" value="EXPENSE" />
        </el-select>
        <el-button type="primary" @click="handleSearch">查询</el-button>
      </div>
      <div class="table-with-pagination">
        <div class="table-flex-grow">
          <el-table :data="paginatedRecords" style="width: 100%" v-loading="loading" border>
            <el-table-column prop="clubId" label="社团名称" width="80">
              <template #default="scope">
                {{ clubMap[String(scope.row.clubId)] || scope.row.clubId }}
              </template>
            </el-table-column>
            <el-table-column prop="type" label="类型">
              <template #default="scope">
                <span>{{ scope.row.type === 'INCOME' ? '收入' : '支出' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="amount" label="金额" />
            <el-table-column prop="description" label="描述" />
            <el-table-column prop="recordTime" label="日期">
              <template #default="scope">
                {{ formatDate(scope.row.recordTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" v-if="userStore.role === 'ADMIN' || userStore.role === 'LEADER'">
              <template #default="scope">
                <el-button size="small" @click="openEditDialog(scope.row)">修改</el-button>
                <el-button v-if="userStore.role === 'ADMIN'" size="small" type="danger" @click="confirmDelete(scope.row)">删除</el-button>
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
    <!-- 新增记录弹窗 -->
    <el-dialog v-model="showCreateDialog" title="新增财务记录" width="400px">
      <el-form :model="createForm" label-width="80px">
        <el-form-item label="社团">
          <el-select v-model="createForm.clubId" placeholder="请选择社团">
            <el-option v-for="club in allClubs" :key="club.id" :label="club.name" :value="club.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="createForm.type" placeholder="请选择类型">
            <el-option label="收入" value="INCOME" />
            <el-option label="支出" value="EXPENSE" />
          </el-select>
        </el-form-item>
        <el-form-item label="金额">
          <el-input v-model.number="createForm.amount" type="number" autocomplete="off" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="createForm.description" autocomplete="off" />
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker v-model="createForm.recordTime" type="datetime" placeholder="选择日期" style="width: 100%;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" :loading="createLoading" @click="handleCreate">确定</el-button>
      </template>
    </el-dialog>
    <!-- 编辑记录弹窗 -->
    <el-dialog v-model="showEditDialog" title="修改财务记录" width="400px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="社团">
          <el-select v-model="editForm.clubId" placeholder="请选择社团">
            <el-option v-for="club in allClubs" :key="club.id" :label="club.name" :value="club.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="editForm.type" placeholder="请选择类型">
            <el-option label="收入" value="INCOME" />
            <el-option label="支出" value="EXPENSE" />
          </el-select>
        </el-form-item>
        <el-form-item label="金额">
          <el-input v-model.number="editForm.amount" type="number" autocomplete="off" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="editForm.description" autocomplete="off" />
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker v-model="editForm.recordTime" type="datetime" placeholder="选择日期" style="width: 100%;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" :loading="editLoading" @click="handleEdit">确定</el-button>
      </template>
    </el-dialog>
    <!-- 删除确认弹窗 -->
    <el-dialog v-model="showDeleteDialog" title="删除确认" width="300px">
      <span>确定要删除该财务记录?</span>
      <template #footer>
        <el-button @click="showDeleteDialog = false">取消</el-button>
        <el-button type="danger" :loading="deleteLoading" @click="handleDelete">删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import http from '../config/http'
import { useUserStore } from '../stores/user'

const allRecords = ref<any[]>([])
const allClubs = ref<any[]>([])
const clubMap = computed(() => {
  const map: Record<string, string> = {}
  allClubs.value.forEach((c: any) => { map[String(c.id)] = c.name })
  return map
})
const searchClubId = ref('')
const searchType = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

const userStore = useUserStore()
const showCreateDialog = ref(false)
const createForm = ref({
  clubId: '',
  type: '',
  amount: null,
  description: '',
  recordTime: ''
})
const createLoading = ref(false)

const showEditDialog = ref(false)
const editForm = ref({
  id: null,
  clubId: '',
  type: '',
  amount: null,
  description: '',
  recordTime: ''
})
const editLoading = ref(false)

const showDeleteDialog = ref(false)
const deleteRecordId = ref<number|null>(null)
const deleteLoading = ref(false)

const filteredRecords = computed(() => {
  let result = allRecords.value
  if (searchClubId.value) {
    result = result.filter((rec: any) => String(rec.clubId) === String(searchClubId.value))
  }
  if (searchType.value) {
    result = result.filter((rec: any) => rec.type === searchType.value)
  }
  return result
})

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredRecords.value.slice(start, end)
})

const total = computed(() => filteredRecords.value.length)

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  return dateStr.replace('T', ' ').slice(0, 16)
}

async function fetchClubs() {
  const res = await http.get('/clubs', { params: { page: 1, size: 10000 } })
  allClubs.value = res.data.list
}

async function fetchRecords() {
  loading.value = true
  try {
    const res = await http.get('/finance-records', {
      params: {
        page: 1,
        size: 10000
      }
    })
    allRecords.value = res.data.list
  } finally {
    loading.value = false
  }
}

function handlePageChange(page: number) {
  currentPage.value = page
}

function handleSearch() {
  currentPage.value = 1
}

function openCreateDialog() {
  createForm.value = { clubId: '', type: '', amount: null, description: '', recordTime: '' }
  showCreateDialog.value = true
}

async function handleCreate() {
  createLoading.value = true
  try {
    const payload = {
      ...createForm.value,
      recordedBy: userStore.userId
    }
    await http.post('/finance-records', payload)
    showCreateDialog.value = false
    fetchRecords()
  } finally {
    createLoading.value = false
  }
}

function openEditDialog(row: any) {
  editForm.value = { ...row }
  showEditDialog.value = true
}

async function handleEdit() {
  editLoading.value = true
  try {
    const payload = {
      ...editForm.value,
      recordedBy: userStore.userId
    }
    await http.put(`/finance-records/${editForm.value.id}`, payload)
    showEditDialog.value = false
    fetchRecords()
  } finally {
    editLoading.value = false
  }
}

function confirmDelete(row: any) {
  deleteRecordId.value = row.id
  showDeleteDialog.value = true
}

async function handleDelete() {
  if (!deleteRecordId.value) return
  deleteLoading.value = true
  try {
    await http.delete(`/finance-records/${deleteRecordId.value}`)
    showDeleteDialog.value = false
    fetchRecords()
  } finally {
    deleteLoading.value = false
  }
}

onMounted(() => {
  fetchClubs()
  fetchRecords()
})
</script>

<style scoped>
.finance-list-container {
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
.table-with-pagination {
  min-height: 500px;
  display: flex;
  flex-direction: column;
}
.table-flex-grow {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
</style> 