<template>
    <div class="home-container">
        <div class="stats-row">
            <el-card class="stat-card club">
                <div class="stat-title"><el-icon><i class="el-icon-office-building" /></el-icon> 社团数</div>
                <div class="stat-value">{{ clubCount }}</div>
            </el-card>
            <el-card class="stat-card activity">
                <div class="stat-title"><el-icon><i class="el-icon-date" /></el-icon> 活动数</div>
                <div class="stat-value">{{ activityCount }}</div>
            </el-card>
            <el-card class="stat-card member">
                <div class="stat-title"><el-icon><i class="el-icon-user" /></el-icon> 成员数</div>
                <div class="stat-value">{{ memberCount }}</div>
            </el-card>
        </div>
        <el-card class="home-card">
            <h1>学生社团管理系统</h1>
            <p class="welcome">欢迎使用学生社团管理系统！</p>
            <div class="features">
                <el-row :gutter="20">
                    <el-col :span="6">
                        <el-card shadow="hover" class="feature-card" @click="goTo('PieChartView')">
                            <div class="feature-title">社团人数统计</div>
                            <div class="feature-desc">可视化展示各社团人数占比</div>
                        </el-card>
                    </el-col>
                    <el-col :span="6">
                        <el-card shadow="hover" class="feature-card" @click="goTo('ClubList')">
                            <div class="feature-title">社团信息</div>
                            <div class="feature-desc">查看、创建、编辑和删除社团信息</div>
                        </el-card>
                    </el-col>
                    <el-col :span="6" v-if="userStore.role !== 'MEMBER'">
                        <el-card shadow="hover" class="feature-card" @click="goTo('MembershipReview')">
                            <div class="feature-title">加入社团审核</div>
                            <div class="feature-desc">审核入社申请，管理成员资格</div>
                        </el-card>
                    </el-col>
                    <el-col :span="6">
                        <el-card shadow="hover" class="feature-card" @click="goTo('DepartmentList')">
                            <div class="feature-title" v-if="userStore.role !== 'MEMBER'">部门管理</div>
                            <div class="feature-title" v-if="userStore.role == 'MEMBER'">加入社团部门</div>
                            <div class="feature-desc">查看、创建、编辑和删除部门信息</div>
                        </el-card>
                    </el-col>

                    <el-col :span="6" v-if="userStore.role !== 'MEMBER'">
                        <el-card shadow="hover" class="feature-card" @click="goTo('Finance')">
                            <div class="feature-title">财政管理</div>
                            <div class="feature-desc">管理社团财务收支记录</div>
                        </el-card>
                    </el-col>
                    <el-col :span="6">
                        <el-card shadow="hover" class="feature-card" @click="goTo('ActivityEnrollment')">
                            <div class="feature-title">活动报名信息</div>
                            <div class="feature-desc">管理活动报名信息</div>
                        </el-card>
                    </el-col>
                    <el-col :span="6">
                        <el-card shadow="hover" class="feature-card" @click="goTo('ActivityList')">
                            <div class="feature-title" v-if="userStore.role !== 'MEMBER'">活动管理</div>
                            <div class="feature-title" v-if="userStore.role == 'MEMBER'">报名活动</div>
                            <div class="feature-desc">查看、创建、编辑和删除活动信息</div>
                        </el-card>
                    </el-col>

                    <el-col :span="6" v-if="userStore.role !== 'MEMBER'">
                        <el-card shadow="hover" class="feature-card" @click="goTo('MemberShipList')">
                            <div class="feature-title">用户信息管理</div>
                            <div class="feature-desc">管理用户信息</div>
                        </el-card>
                    </el-col>
                    
                </el-row>
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import http from '../config/http'
const router = useRouter()
const userStore = useUserStore()

const clubCount = ref(0)
const activityCount = ref(0)
const memberCount = ref(0)

async function fetchStats() {
    // 获取社团数
    const clubRes = await http.get('/clubs', { params: { page: 1, size: 10000 } })
    clubCount.value = Array.isArray(clubRes.data.list) ? clubRes.data.list.length : 0
    // 获取活动数
    const actRes = await http.get('/activities', { params: { pageNum: 1, pageSize: 1 } })
    activityCount.value = actRes.data.total || (Array.isArray(actRes.data.records) ? actRes.data.records.length : 0)
    // 获取成员数
    const userRes = await http.get('/users')
    memberCount.value = Array.isArray(userRes.data) ? userRes.data.length : 0
}

function goTo(name: string) {
    router.push({ name })
}

onMounted(() => {
    fetchStats()
})
</script>

<style scoped>
.home-container {
    min-height: 100vh;
    width: 100vw;
    margin: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.stats-row {
    display: flex;
    gap: 32px;
    margin-top: 48px;
    margin-bottom: 24px;
}

.stat-card {
    min-width: 180px;
    min-height: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 0;
    box-shadow: none;
    background: transparent;
    font-family: 'ZCOOL KuaiLe', 'Arial', sans-serif;
    transition: box-shadow 0.2s, transform 0.2s;
}
.stat-card:hover {
    box-shadow: 0 8px 32px rgba(25, 118, 210, 0.18);
    transform: translateY(-4px) scale(1.04);
}
.stat-title {
    font-size: 18px;
    color: #1976d2;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
}
.stat-value {
    font-size: 32px;
    font-weight: bold;
    color: #43a047;
    letter-spacing: 2px;
}
.stat-card.club .stat-value { color: #1976d2; }
.stat-card.activity .stat-value { color: #ff9800; }
.stat-card.member .stat-value { color: #43a047; }

.home-card {
    width: 100%;
    max-width: 700px;
    padding: 40px 32px 32px 32px;
    text-align: center;
    border-radius: 0;
    box-shadow: none;
    background: transparent;
}

h1 {
    font-family: 'ZCOOL KuaiLe', 'Arial', sans-serif;
    font-size: 2.4rem;
    color: #1976d2;
    letter-spacing: 2px;
    margin-bottom: 8px;
}

.welcome {
    font-size: 20px;
    margin: 16px 0 32px 0;
    color: #43a047;
    font-weight: bold;
    letter-spacing: 1px;
}

.features {
    margin-top: 24px;
}

.feature-card {
    cursor: pointer;
    transition: box-shadow 0.2s, transform 0.2s;
    border-radius: 12px;
    min-height: 120px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%);
    color: #333;
    box-shadow: 0 2px 12px rgba(25, 118, 210, 0.08);
}

.feature-card:hover {
    box-shadow: 0 8px 32px rgba(64, 158, 255, 0.18);
    transform: translateY(-4px) scale(1.03);
}

.feature-title {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 8px;
    color: #1976d2;
}

.feature-desc {
    color: #666;
    font-size: 15px;
}
</style>