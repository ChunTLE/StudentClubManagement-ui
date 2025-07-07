<template>
    <div class="login-container">
        <el-card class="login-card">
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
                <div class="form-group captcha-group">
                    <label for="captcha">验证码</label>
                    <div class="captcha-row">
                        <input id="captcha" v-model="captchaCode" type="text" required />
                        <img :src="captchaImg" alt="验证码" @click="fetchCaptcha" class="captcha-img" />
                    </div>
                </div>
                <button type="submit">登录</button>
            </form>
            <button type="button" @click="goRegister" class="register-btn">注册</button>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { LOGIN_API } from '../config/index'
import http, { startTokenCheck } from '../config/http'
import { ElMessage } from 'element-plus'

const username = ref('')
const password = ref('')
const captchaImg = ref('')
const captchaId = ref('')
const captchaCode = ref('')
const router = useRouter()
const userStore: any = useUserStore()

async function fetchCaptcha() {
    const res = await http.get('/auth/captcha')
    let img = res.data.captchaImage
    // 去除重复的前缀，只保留一个
    if (img.startsWith('data:image/png;base64,data:image/png;base64,')) {
        img = img.replace('data:image/png;base64,data:image/png;base64,', 'data:image/png;base64,')
    }
    captchaImg.value = img
    captchaId.value = res.data.captchaId
}

onMounted(() => {
    fetchCaptcha()
})

async function handleLogin() {
    try {
        const res = await http.post(LOGIN_API, {
            username: username.value,
            password: password.value,
            captcha: captchaCode.value,
            captchaId: captchaId.value
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

        // 登录成功后拉取头像
        await userStore.loadAvatar()

        router.push('/')

    } catch (err) {
        // 错误提示已由http拦截器处理
        fetchCaptcha(); // 自动刷新验证码
        captchaCode.value = '' // 清空验证码输入框
    }
}

function goRegister() {
    router.push('/register')
}
</script>

<style scoped>
.login-container {
    min-height: 100vh;
    min-width: 100vw;
    display: flex;
    align-items: center;
    justify-content: center;
    background: url('@/assets/login-bg.jpg') center center/cover no-repeat;
}

.login-card {
    box-shadow: 0 4px 24px rgba(25, 118, 210, 0.15);
    border-radius: 12px;
    padding: 40px 32px;
    background: rgba(255,255,255,0.95);
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

.captcha-group .captcha-row {
    display: flex;
    align-items: center;
    gap: 8px;
}

.captcha-img {
    height: 38px;
    cursor: pointer;
    border-radius: 4px;
    border: 1px solid #ccc;
}
</style>
