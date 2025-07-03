<template>
    <div class="nav-container">
        <el-menu :default-active="activeMenu" mode="horizontal" class="nav-bar" @select="onSelect">
            <el-menu-item index="/">首页</el-menu-item>
            <el-menu-item index="/clubs">社团管理</el-menu-item>
            <el-menu-item index="/finance">财政管理</el-menu-item>
            <el-menu-item index="/activities">活动管理</el-menu-item>
            <el-menu-item index="/departments">部门管理</el-menu-item>
            <el-menu-item index="/membership-review">加入社团审核</el-menu-item>
            <el-menu-item index="/enrollments">活动报名管理</el-menu-item>
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
    if (route.path.startsWith('/membership-review')) return '/membership-review'
    if (route.path.startsWith('/enrollments')) return '/enrollments'
    return '/'
})

function onSelect(index: string) {
    router.push(index)
}

function handleCommand(command: string) {
    if (command === 'logout') {
        userStore.$reset()
        router.push('/login')
    }
}
</script>

<style scoped>
.nav-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 24px;
}

.nav-bar {
    flex: 1;
    font-size: 16px;
    border-bottom: none;
}

.user-info {
    padding: 0 20px;
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