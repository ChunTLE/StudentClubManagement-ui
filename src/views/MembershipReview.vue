<template>
    <div class="membership-review-container">
        <el-card>
            <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 20px; font-weight: bold;">加入社团审核</span>
            </div>
            <el-table :data="pendingMemberships" style="width: 100%" v-loading="loading" border>
                <el-table-column prop="userId" label="申请人" width="60">
                    <template #default="scope">
                        {{ userMap[String(scope.row.userId)] || '' }}
                    </template>
                </el-table-column>
                <el-table-column prop="clubId" label="社团">
                    <template #default="scope">
                        {{ clubMap[String(scope.row.clubId)] || scope.row.clubId }}
                    </template>
                </el-table-column>
                <el-table-column prop="departmentId" label="部门">
                    <template #default="scope">
                        {{ departmentMap[String(scope.row.departmentId)] || '-' }}
                    </template>
                </el-table-column>
                <el-table-column prop="position" label="职位" />
                <el-table-column prop="joinedAt" label="申请时间">
                    <template #default="scope">
                        {{ formatDate(scope.row.joinedAt) }}
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template #default="scope">
                        <el-button size="small" type="success" @click="handleApprove(scope.row)">通过</el-button>
                        <el-button size="small" type="danger" @click="handleReject(scope.row)">拒绝</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div style="margin-top: 16px; display: flex; justify-content: center;">
                <el-pagination background layout="total, prev, pager, next, jumper" :total="pendingMemberships.length"
                    :page-size="pageSize" :current-page="currentPage" @current-change="handlePageChange" />
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import http from '../config/http'

const memberships = ref<any[]>([])
const users = ref<any[]>([])
const clubs = ref<any[]>([])
const departments = ref<any[]>([])
const loading = ref(false)

const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)

const userMap = computed(() => {
    const map: Record<string, string> = {}
    users.value.forEach((u: any) => { map[String(u.id)] = u.realName || u.username })
    return map
})
const clubMap = computed(() => {
    const map: Record<string, string> = {}
    clubs.value.forEach((c: any) => { map[String(c.id)] = c.name })
    return map
})
const departmentMap = computed(() => {
    const map: Record<string, string> = {}
    departments.value.forEach((d: any) => { map[String(d.id)] = d.name })
    return map
})

const pendingMemberships = computed(() => memberships.value.filter((m: any) => m.status === 'PENDING'))

function formatDate(dateStr: string) {
    if (!dateStr) return ''
    return dateStr.replace('T', ' ').slice(0, 16)
}

// 获取当前用户信息
let role = ''
let userId: number | null = null
try {
    const userStr = localStorage.getItem('user')
    if (userStr) {
        const userObj = JSON.parse(userStr)
        role = userObj.role || ''
        userId = userObj.userId || null
    }
} catch (e) { }

async function fetchAll() {
    loading.value = true
    try {
        const params: any = {
            pageNum: currentPage.value,
            pageSize: pageSize.value,
            status: 'PENDING'
        }
        // 如果是LEADER，只查自己社团
        if (role === 'LEADER' && userId) {
            params.clubId = userId
        }
        const [memRes, userRes, clubRes, deptRes] = await Promise.all([
            http.get('/memberships', { params }),
            http.get('/users'),
            http.get('/clubs', {
                params: {
                    page: 1,
                    size: 10000
                }
            }),
            http.get('/departments')
        ])
        memberships.value = memRes.data.list || []
        // 前端过滤：如果是LEADER，只显示自己负责社团的审核信息
        if (role && role.toUpperCase() === 'LEADER' && userId) {
            // 找到当前负责人负责的所有社团ID（可能有多个）
            const myClubIds = memberships.value
                .filter(m => m.userId === userId)
                .map(m => m.clubId)
            memberships.value = memberships.value.filter(
                m => myClubIds.includes(m.clubId)
            )
        }
        total.value = memberships.value.length
        users.value = userRes.data || []
        clubs.value = clubRes.data.data?.list || clubRes.data.list || []
        departments.value = deptRes.data.records || []
    } finally {
        loading.value = false
    }
}

function handlePageChange(page: number) {
    currentPage.value = page
    fetchAll()
}

async function handleApprove(row: any) {
    await http.put(`/memberships/${row.id}`, { status: 'APPROVED' })
    await sendMessageToUser(row.userId, `您加入社团"${clubMap.value[String(row.clubId)] || row.clubId}"的申请已通过审核！`)
    fetchAll()
}

async function handleReject(row: any) {
    await http.put(`/memberships/${row.id}`, { status: 'REJECTED' })
    await sendMessageToUser(row.userId, `您加入社团"${clubMap.value[String(row.clubId)] || row.clubId}"的申请未通过审核。`)
    fetchAll()
}

async function sendMessageToUser(userId: number, content: string) {
    await http.post('/message/send', {
        userId,
        title: '系统通知',
        content,
        type: '系统'
    })
}

onMounted(() => {
    fetchAll()
})
</script>

<style scoped>
.membership-review-container {
    max-width: 900px;
    margin: 40px auto;
}
</style>