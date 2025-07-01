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
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const username = ref('')
const password = ref('')

function handleLogin() {
    // 简单演示，实际登录逻辑请对接后端
    if (username.value && password.value) {
        alert(`用户名：${username.value}\n密码：${password.value}`)
    }
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
</style>
