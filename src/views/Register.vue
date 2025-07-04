<template>
  <div class="register-container">
    <h2>用户注册</h2>
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="username">用户名</label>
        <input id="username" v-model="registerForm.username" type="text" required />
      </div>
      <div class="form-group">
        <label for="password">密码</label>
        <input id="password" v-model="registerForm.password" type="password" required />
      </div>
      <div class="form-group">
        <label for="realName">真实姓名</label>
        <input id="realName" v-model="registerForm.realName" type="text" required />
      </div>
      <div class="form-group">
        <label for="email">邮箱</label>
        <input id="email" v-model="registerForm.email" type="email" required />
      </div>
      <div class="form-group">
        <label for="role">角色</label>
        <select id="role" v-model="registerForm.role" required>
          <option value="">请选择角色</option>
          <option value="MEMBER">干事</option>
          <option value="LEADER">社团负责人</option>
        </select>
      </div>
      <button type="submit">注册</button>
      <button type="button" @click="goLogin" class="login-btn">返回登录</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import http from '../config/http'

const router = useRouter()
const registerForm = ref({
  username: '',
  password: '',
  realName: '',
  email: '',
  role: ''
})

async function handleRegister() {
  try {
    await http.post('/auth/register', registerForm.value)
    ElMessage.success('注册成功，请登录')
    // 跳转到登录页并带上用户名
    router.push({ path: '/login', query: { username: registerForm.value.username } })
  } catch (err) {
    ElMessage.error('注册失败')
  }
}

function goLogin() {
  router.push('/login')
}
</script>

<style scoped>
.register-container {
  max-width: 350px;
  margin: 80px auto;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background: #fff;
}

.register-container h2 {
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
input[type="password"],
input[type="email"],
select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

button[type="submit"] {
  width: 100%;
  padding: 0.7rem;
  background: #67c23a;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
button[type="submit"]:hover {
  background: #43a047;
}
.login-btn {
  width: 100%;
  margin-top: 1rem;
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.7rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.login-btn:hover {
  background: #1976d2;
}
</style> 