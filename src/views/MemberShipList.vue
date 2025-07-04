<template>
  <div class="membership-list-container">
    <el-card>
      <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 20px; font-weight: bold;">用户信息列表</span>
      </div>

      <div style="margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
        <el-input v-model="searchUsername" placeholder="输入用户名" style="width: 200px;" />
        <el-input v-model="searchRealName" placeholder="输入真实姓名" style="width: 200px;" />
        <el-select v-model="searchRole" placeholder="选择角色" style="width: 150px;" clearable>
          <el-option label="全部" value="" />
          <el-option label="干事" value="MEMBER" />
          <el-option label="社团负责人" value="LEADER" />
          <el-option label="管理员" value="ADMIN" />
        </el-select>
        <el-select v-model="searchStatus" placeholder="选择状态" style="width: 150px;" clearable>
          <el-option label="全部" :value="null" />
          <el-option label="账号正常" :value="1" />
          <el-option label="账号封禁" :value="0" />
        </el-select>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </div>

      <div class="table-with-pagination">
        <div class="table-flex-grow">
          <el-table :data="paginatedMemberships" style="width: 100%" v-loading="loading" border>
            <el-table-column prop="username" label="用户名" />
            <el-table-column prop="email" label="邮箱" />
            <el-table-column prop="realName" label="真实姓名" />
            <el-table-column prop="role" label="角色">
              <template #default="scope">
                <el-tag v-if="scope.row.role === 'MEMBER'" type="info">干事</el-tag>
                <el-tag v-else-if="scope.row.role === 'LEADER'" type="warning">社团负责人</el-tag>
                <el-tag v-else-if="scope.row.role === 'ADMIN'" type="danger">管理员</el-tag>
                <span v-else>{{ scope.row.role }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="账号状态">
              <template #default="scope">
                <el-tag v-if="scope.row.status === 1" type="success">账号正常</el-tag>
                <el-tag v-else-if="scope.row.status === 0" type="danger">账号封禁</el-tag>
                <span v-else>{{ scope.row.status }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="clubName" label="社团名称" />
            <el-table-column prop="departmentName" label="部门名称" />
            <el-table-column prop="createdAt" label="创建时间">
              <template #default="scope">
                {{ formatDate(scope.row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" v-if="userStore.role === 'ADMIN' || 'LEADER'">
              <template #default="scope">
                <el-button size="small" @click="openEditDialog(scope.row)">修改</el-button>
                <el-button size="small" :type="scope.row.status === 1 ? 'danger' : 'success'"
                  @click="toggleUserStatus(scope.row)" v-if="userStore.role === 'ADMIN'">
                  {{ scope.row.status === 1 ? '封禁' : '解封' }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="table-pagination-wrapper">
          <el-pagination background layout="total, prev, pager, next, jumper" :total="total" :page-size="pageSize"
            :current-page="currentPage" @current-change="handlePageChange" />
        </div>
      </div>
    </el-card>

    <!-- 编辑会员对话框 -->
    <el-dialog v-model="showEditDialog" title="修改用户信息" width="500px">
      <el-form :model="editForm" label-width="100px" :rules="editRules" ref="editFormRef">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" autocomplete="off" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" autocomplete="off" />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="editForm.realName" autocomplete="off" />
        </el-form-item>
        <el-form-item label="角色" prop="role" v-if="userStore.role === 'ADMIN'">
          <el-select v-model="editForm.role" placeholder="选择角色" style="width: 100%;">
            <el-option label="干事" value="MEMBER" />
            <el-option label="社团负责人" value="LEADER" />
            <el-option label="管理员" value="ADMIN" />
          </el-select>
        </el-form-item>
        <el-form-item label="社团" prop="clubId">
          <el-select v-model="editForm.clubId" placeholder="选择社团" style="width: 100%;">
            <el-option v-for="club in clubs" :key="club.id" :label="club.name" :value="club.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="部门" prop="departmentId">
          <el-select v-model="editForm.departmentId" placeholder="选择部门" style="width: 100%;" clearable>
            <el-option label="无" :value="null" />
            <el-option v-for="dept in departments" :key="dept.id" :label="dept.name" :value="dept.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" :loading="editLoading" @click="handleEditMembership">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import http from '../config/http'
import { useUserStore } from '../stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'

const allMemberships = ref<any[]>([])
const searchUsername = ref('')
const searchRealName = ref('')
const searchRole = ref('')
const searchStatus = ref<number | null>(null)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

const userStore = useUserStore()

const showEditDialog = ref(false)
const editFormRef = ref()
const editForm = ref<any>({
  id: null,
  membershipId: null,
  username: '',
  email: '',
  realName: '',
  role: 'MEMBER',
  clubId: null,
  departmentId: null
})
const editLoading = ref(false)

const editRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  clubId: [{ required: true, message: '请选择社团', trigger: 'change' }]
}

const clubs = ref<any[]>([])
const allDepartments = ref<any[]>([])
const departments = ref<any[]>([])

const clubMap = computed(() => {
  const map: Record<string, string> = {}
  clubs.value.forEach((c: any) => { map[String(c.id)] = c.name })
  return map
})

const departmentMap = computed(() => {
  const map: Record<string, string> = {}
  allDepartments.value.forEach((d: any) => { map[String(d.id)] = d.name })
  return map
})

const filteredMemberships = computed(() => {
  let filtered = allMemberships.value

  if (searchUsername.value) {
    filtered = filtered.filter(item =>
      item.username && item.username.includes(searchUsername.value)
    )
  }

  if (searchRealName.value) {
    filtered = filtered.filter(item =>
      item.realName && item.realName.includes(searchRealName.value)
    )
  }

  if (searchRole.value) {
    filtered = filtered.filter(item => item.role === searchRole.value)
  }

  if (searchStatus.value !== null) {
    filtered = filtered.filter(item => item.status === searchStatus.value)
  }

  return filtered
})

const paginatedMemberships = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredMemberships.value.slice(start, end)
})

const total = computed(() => filteredMemberships.value.length)

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  return dateStr.replace('T', ' ')
}

async function fetchMemberships() {
  loading.value = true
  try {
    const [usersRes, membershipsRes, clubsRes, deptRes] = await Promise.all([
      http.get('/users'),
      http.get('/memberships'),
      http.get('/clubs', { params: { page: 1, size: 10000 } }),
      http.get('/departments/all')
    ])
    const users = usersRes.data || []
    const memberships = membershipsRes.data.list || []
    clubs.value = clubsRes.data.data?.list || clubsRes.data.list || []
    allDepartments.value = deptRes.data || []

    console.log('users:', users)
    console.log('memberships:', memberships)

    // 合并数据
    const mergedData = users.map((user: any) => {
      const membership = memberships.find((m: any) => m.userId === user.id)
      return {
        ...user,
        id: user.id, // 确保有 id 字段
        clubId: membership ? membership.clubId : null,
        departmentId: membership ? membership.departmentId : null,
        clubName: membership && clubMap.value[String(membership.clubId)] ? clubMap.value[String(membership.clubId)] : '-',
        departmentName: membership && departmentMap.value[String(membership.departmentId)] ? departmentMap.value[String(membership.departmentId)] : '-',
        membershipId: membership ? membership.id : null
      }
    })
    allMemberships.value = mergedData
  } catch (error) {
    console.error('获取会员列表失败:', error)
    ElMessage.error('获取会员列表失败')
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

function resetSearch() {
  searchUsername.value = ''
  searchRealName.value = ''
  searchRole.value = ''
  searchStatus.value = null
  currentPage.value = 1
}

function openEditDialog(row: any) {
  editForm.value = { ...row }
  if (row.clubId) {
    departments.value = allDepartments.value.filter((d: any) => d.clubId === row.clubId)
  } else {
    departments.value = []
  }
  showEditDialog.value = true
}

async function handleEditMembership() {
  if (!editFormRef.value) return

  if (!editForm.value.id) {
    ElMessage.error('用户ID不存在，无法保存');
    return;
  }

  if (!editForm.value.membershipId) {
    ElMessage.error('会员ID不存在，无法保存');
    return;
  }

  try {
    await editFormRef.value.validate()
    editLoading.value = true

    // 更新用户信息
    await http.put(`/users/${editForm.value.id}`, {
      username: editForm.value.username,
      email: editForm.value.email,
      realName: editForm.value.realName,
      role: editForm.value.role
    })

    // 更新会员关系（社团和部门）
    await http.put(`/memberships/${editForm.value.membershipId}/club-department`, {
      clubId: editForm.value.clubId,
      departmentId: editForm.value.departmentId
    })

    showEditDialog.value = false
    ElMessage.success('修改会员信息成功')
    fetchMemberships()
  } catch (error) {
    const err = error as any;
    let msg = '修改会员信息失败';
    if (err && err.message) {
      msg = err.message;
    } else if (err && err.response && err.response.data && err.response.data.message) {
      msg = err.response.data.message;
    } else {
      try {
        msg = JSON.stringify(err);
      } catch (e) { }
    }
    ElMessage.error(msg);
    console.error('详细错误信息:', err);
  } finally {
    editLoading.value = false
  }
}

async function toggleUserStatus(row: any) {
  try {
    const action = row.status === 1 ? '封禁' : '解封'
    await ElMessageBox.confirm(`确定要${action}用户"${row.username}"吗？`, '确认操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await http.put(`/users/${row.id}/status`, null, {
      params: {
        status: row.status === 1 ? 0 : 1
      }
    })

    ElMessage.success(`${action}用户成功`)
    fetchMemberships()
  } catch (error) {
    const err = error as any;
    let msg = '操作失败';
    if (err && err.message) {
      msg = err.message;
    } else if (err && err.response && err.response.data && err.response.data.message) {
      msg = err.response.data.message;
    } else {
      try {
        msg = JSON.stringify(err);
      } catch (e) { }
    }
    ElMessage.error(msg);
    console.error('详细错误信息:', err);
  }
}

watch(() => editForm.value.clubId, (newClubId) => {
  if (newClubId) {
    departments.value = allDepartments.value.filter((d: any) => d.clubId === newClubId)
  } else {
    departments.value = []
  }
  editForm.value.departmentId = null // 切换社团时清空部门选择
})

onMounted(() => {
  fetchMemberships()
})
</script>

<style scoped>
.membership-list-container {
  padding: 20px;
}

.table-with-pagination {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 300px);
}

.table-flex-grow {
  flex: 1;
  overflow: auto;
}

.table-pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}
</style>
