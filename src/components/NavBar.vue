<template>
    <div class="nav-layout">
        <el-menu :default-active="activeMenu" mode="vertical" class="nav-bar" @select="onSelect">
            <el-menu-item index="/home">首页</el-menu-item>
            <el-menu-item index="/clubs">社团信息</el-menu-item>
            <el-menu-item index="/departments" v-if="userStore.role == 'MEMBER'">加入社团部门</el-menu-item>
            <el-menu-item index="/finance" v-if="userStore.role !== 'MEMBER'">财政管理</el-menu-item>
            <el-menu-item index="/activities" v-if="userStore.role !== 'MEMBER'">活动管理</el-menu-item>
            <el-menu-item index="/enrollments">活动报名信息</el-menu-item>
            <el-menu-item index="/activities" v-if="userStore.role == 'MEMBER'">报名活动</el-menu-item>
            <el-menu-item index="/departments" v-if="userStore.role !== 'MEMBER'">部门管理</el-menu-item>
            <el-menu-item index="/membership-review" v-if="userStore.role !== 'MEMBER'">加入社团审核</el-menu-item>
            <el-menu-item index="/users" v-if="userStore.role !== 'MEMBER'">用户信息管理</el-menu-item>
        </el-menu>

        <div class="user-info">
            <el-dropdown @command="handleCommand">
                <span class="user-dropdown">
                    <el-avatar :src="userStore.avatar || defaultAvatar" size="small" style="margin-right: 8px" />
                    {{ userStore.realName || userStore.username }}
                    <el-icon class="el-icon--right"><arrow-down /></el-icon>
                </span>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                        <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { computed, watch } from 'vue'
import { useUserStore } from '../stores/user'
import { ArrowDown } from '@element-plus/icons-vue'
import { ElAvatar } from 'element-plus'
import defaultAvatar from '../assets/default-avatar.png'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const activeMenu = computed(() => {
    if (route.path.startsWith('/clubs')) return '/clubs'
    if (route.path.startsWith('/finance')) return '/finance'
    if (route.path.startsWith('/activities')) return '/activities'
    if (route.path.startsWith('/membership-review')) return '/membership-review'
    if (route.path.startsWith('/enrollments')) return '/enrollments'
    if (route.path.startsWith('/departments')) return '/departments'
    if (route.path.startsWith('/users')) return '/users'
    return '/'
})

function onSelect(index: string) {
    router.push(index)
}

function handleCommand(command: string) {
    if (command === 'logout') {
        userStore.$reset()
        router.push('/login')
    } else if (command === 'profile') {
        router.push('/user-profile')
    }
}
</script>

<style scoped>
.nav-layout {
    display: flex;
    height: 100vh;
}

.nav-bar {
    width: 200px;
    min-height: 100vh;
    border-right: 1px solid #f0f0f0;
    font-size: 16px;
}

.user-info {
    position: absolute;
    left: 0;
    bottom: 20px;
    width: 200px;
    display: flex;
    justify-content: center;
}

.user-dropdown {
    display: flex;
    align-items: center;
    cursor: pointer;
    color: #409eff;
    font-size: 14px;
}

.user-dropdown:hover {
    color: #66b1ff;
}
</style>