<template>
    <div class="enrollment-container">
        <el-card>
            <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 20px; font-weight: bold;">活动报名管理</span>
                <el-button type="primary" @click="showCreateDialog = true">新增报名</el-button>
            </div>
            <div style="margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                <el-input v-model="searchUsername" placeholder="按用户名筛选" style="width: 140px;" />
                <el-input v-model="searchActivityName" placeholder="按活动名称筛选" style="width: 140px;" />
                <el-button type="primary" @click="handleSearch">查询</el-button>
                <el-button @click="resetSearch">重置</el-button>
            </div>
            <el-table :data="enrollments" style="width: 100%" v-loading="loading" border>
                <el-table-column prop="username" label="用户名" />
                <el-table-column prop="activityTitle" label="活动名称" />
                <el-table-column prop="enrolledAt" label="报名时间">
                    <template #default="scope">
                        {{ formatDate(scope.row.enrolledAt) }}
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template #default="scope">
                        <el-button size="small" @click="openEditDialog(scope.row)">修改</el-button>
                        <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div style="margin-top: 16px; display: flex; justify-content: center;">
                <el-pagination background layout="total, prev, pager, next, jumper" :total="total" :page-size="pageSize"
                    :current-page="currentPage" @current-change="handlePageChange" />
            </div>
        </el-card>
        <el-dialog v-model="showCreateDialog" title="新增报名" width="400px">
            <el-form :model="createForm" label-width="80px">
                <el-form-item label="用户">
                    <el-select v-model="createForm.userId" placeholder="请选择用户">
                        <el-option v-for="user in users" :key="user.id" :label="user.realName || user.username"
                            :value="user.id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="活动">
                    <el-select v-model="createForm.activityId" placeholder="请选择活动">
                        <el-option v-for="activity in activities" :key="activity.id" :label="activity.title"
                            :value="activity.id" />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="showCreateDialog = false">取消</el-button>
                <el-button type="primary" :loading="createLoading" @click="handleCreate">确定</el-button>
            </template>
        </el-dialog>
        <el-dialog v-model="showEditDialog" title="修改报名" width="400px">
            <el-form :model="editForm" label-width="80px">
                <el-form-item label="用户">
                    <el-select v-model="editForm.userId" placeholder="请选择用户">
                        <el-option v-for="user in users" :key="user.id" :label="user.realName || user.username"
                            :value="user.id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="活动">
                    <el-select v-model="editForm.activityId" placeholder="请选择活动">
                        <el-option v-for="activity in activities" :key="activity.id" :label="activity.title"
                            :value="activity.id" />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="showEditDialog = false">取消</el-button>
                <el-button type="primary" :loading="editLoading" @click="handleEdit">保存</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import http from '../config/http'

const enrollments = ref<any[]>([])
const users = ref<any[]>([])
const activities = ref<any[]>([])
const loading = ref(false)

const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)

const searchUserId = ref('')
const searchUsername = ref('')
const searchActivityName = ref('')

const showCreateDialog = ref(false)
const createForm = ref({ userId: '', activityId: '' })
const createLoading = ref(false)

const showEditDialog = ref(false)
const editForm = ref({ id: '', userId: '', activityId: '' })
const editLoading = ref(false)

function formatDate(dateStr: string) {
    if (!dateStr) return ''
    return dateStr.replace('T', ' ').slice(0, 16)
}

async function fetchAll() {
    loading.value = true
    try {
        const [enrollRes, userRes, activityRes] = await Promise.all([
            http.get('/enrollments', {
                params: {
                    pageNum: currentPage.value,
                    pageSize: pageSize.value,
                    username: searchUsername.value,
                    activityTitle: searchActivityName.value
                }
            }),
            http.get('/users'),
            http.get('/activities')
        ])
        enrollments.value = enrollRes.data.list || []
        total.value = enrollRes.data.total || 0
        users.value = userRes.data || []
        activities.value = activityRes.data.records || []
        // 映射用户名和活动名
        enrollments.value.forEach(e => {
            const user = users.value.find(u => u.id === e.userId)
            e.username = user ? (user.realName || user.username) : e.userId
            const activity = activities.value.find(a => a.id === e.activityId)
            e.activityTitle = activity ? activity.title : e.activityId
        })
    } finally {
        loading.value = false
    }
}

function handleSearch() {
    currentPage.value = 1
    fetchAll()
}

function resetSearch() {
    searchActivityName.value = ''
    searchUsername.value = ''
    currentPage.value = 1
    fetchAll()
}

function handlePageChange(page: number) {
    currentPage.value = page
    fetchAll()
}

async function handleDelete(row: any) {
    await http.delete(`/enrollments/${row.id}`)
    fetchAll()
}

async function handleCreate() {
    createLoading.value = true
    try {
        await http.post('/enrollments', {
            userId: createForm.value.userId,
            activityId: createForm.value.activityId
        })
        showCreateDialog.value = false
        fetchAll()
    } finally {
        createLoading.value = false
    }
}

function openEditDialog(row: any) {
    editForm.value = { id: row.id, userId: row.userId, activityId: row.activityId }
    showEditDialog.value = true
}

async function handleEdit() {
    editLoading.value = true
    try {
        await http.put(`/enrollments/${editForm.value.id}`, {
            userId: editForm.value.userId,
            activityId: editForm.value.activityId
        })
        showEditDialog.value = false
        fetchAll()
    } finally {
        editLoading.value = false
    }
}

onMounted(() => {
    fetchAll()
})
</script>

<style scoped>
.enrollment-container {
    max-width: 1000px;
    margin: 40px auto;
}
</style>