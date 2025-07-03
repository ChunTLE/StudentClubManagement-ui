<template>
    <div class="home-container">
        <el-card class="home-card">
            <h1>学生社团管理系统</h1>
            <p class="welcome">欢迎使用学生社团管理系统！</p>
            <div class="features">
                <el-row :gutter="20">
                    <el-col :span="6">
                        <el-card shadow="hover" class="feature-card" @click="goTo('ClubList')">
                            <div class="feature-title">社团管理</div>
                            <div class="feature-desc">查看、创建、编辑和删除社团信息</div>
                        </el-card>
                    </el-col>
                    <el-col :span="6">
                        <el-card shadow="hover" class="feature-card" @click="goTo('Finance')">
                            <div class="feature-title">财政管理</div>
                            <div class="feature-desc">管理社团财务收支记录</div>
                        </el-card>
                    </el-col>
                    <el-col :span="6">
                        <el-card shadow="hover" class="feature-card" @click="goTo('ActivityList')">
                            <div class="feature-title">活动管理</div>
                            <div class="feature-desc">查看、创建、编辑和删除活动信息</div>
                        </el-card>
                    </el-col>
                    <el-col :span="6">
                        <el-card shadow="hover" class="feature-card" @click="goTo('DepartmentList')">
                            <div class="feature-title">部门管理</div>
                            <div class="feature-desc">查看、创建、编辑和删除部门信息</div>
                        </el-card>  
                    </el-col>     
                    <el-col :span="6">
                        <el-card shadow="hover" class="feature-card" @click="goTo('MembershipReview')">
                            <div class="feature-title">加入社团审核</div>
                            <div class="feature-desc">审核入社申请，管理成员资格</div>
                        </el-card>
                    </el-col>
                    <el-col :span="6">
                        <el-card shadow="hover" class="feature-card" @click="goTo('ActivityEnrollment')">
                            <div class="feature-title">活动报名管理</div>
                            <div class="feature-desc">管理活动报名信息</div>
                        </el-card>
                    </el-col>
                </el-row>
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
function goTo(name: string) {
    router.push({ name })
}
</script>

<style scoped>
.home-container {
    max-width: 700px;
    margin: 60px auto;
    display: flex;
    justify-content: center;
}

.home-card {
    width: 100%;
    padding: 40px 32px 32px 32px;
    text-align: center;
}

.welcome {
    font-size: 18px;
    margin: 16px 0 32px 0;
    color: #666;
}

.features {
    margin-top: 24px;
}

.feature-card {
    cursor: pointer;
    transition: box-shadow 0.2s;
    border-radius: 8px;
    min-height: 120px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.feature-card:hover {
    box-shadow: 0 4px 24px rgba(64, 158, 255, 0.15);
}

.feature-title {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 8px;
}

.feature-desc {
    color: #888;
    font-size: 15px;
}
</style>