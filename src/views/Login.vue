<template>
    <div class="login-container">
        <h2>社团管理系统登录</h2>
        <form @submit.prevent="handleLogin">
            <div class="form-group">
                <label for="username">用户名</label>
                <input id="username" v-model="username" type="text" required />
            </div>
            <div class="form-group">
                <label for="password">密码</label>
                <input id="password" v-model="password" type="password" required />
            </div>
            <button type="submit">登录</button>
        </form>
        <button type="button" @click="goRegister" class="register-btn">注册</button>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { LOGIN_API } from '../config/index'
import http, { startTokenCheck } from '../config/http'
import { ElMessage } from 'element-plus'

const username = ref('')
const password = ref('')
const router = useRouter()
const userStore = useUserStore()

async function handleLogin() {
    try {
        const res = await http.post(LOGIN_API, {
            username: username.value,
            password: password.value
        })
        // 解析后端返回的data字段
        const userData = res.data
        userStore.token = userData.token
        userStore.username = userData.username
        userStore.userId = userData.userId.toString()
        userStore.realName = userData.realName || ''
        userStore.role = userData.role

        // 启动token状态检查
        startTokenCheck()

        router.push('/')

    } catch (err) {
        // 错误提示已由http拦截器处理
    }
}

function goRegister() {
    router.push('/register')
}
</script>

<style scoped>
.login-container {
    max-width: 350px;
    margin: 80px auto;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    background: #fff;
}

.login-container h2 {
    text-align: center;
    margin-bottom: 1.5rem;
}

.form-group {
    margin-bottom: 1rem;
}

label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
}

input[type="text"],
input[type="password"] {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
}

button[type="submit"] {
    width: 100%;
    padding: 0.7rem;
    background: #409eff;
    color: #fff;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.2s;
}

button[type="submit"]:hover {
    background: #1976d2;
}

.register-btn {
    width: 100%;
    margin-top: 1rem;
    background: #67c23a;
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 0.7rem;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.2s;
}

.register-btn:hover {
    background: #43a047;
}
</style>
