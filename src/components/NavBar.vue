<template>
    <el-menu :default-active="activeMenu" mode="horizontal" class="nav-bar" @select="onSelect">
        <el-menu-item index="/">首页</el-menu-item>
        <el-menu-item index="/clubs">社团管理</el-menu-item>
        <el-menu-item index="/finance">财政管理</el-menu-item>
    </el-menu>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { computed, watch } from 'vue'
const router = useRouter()
const route = useRoute()

const activeMenu = computed(() => {
    if (route.path.startsWith('/clubs')) return '/clubs'
    if (route.path.startsWith('/finance')) return '/finance'
    return '/'
})

function onSelect(index: string) {
    router.push(index)
}
</script>

<style scoped>
.nav-bar {
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 24px;
    font-size: 16px;
}
</style>