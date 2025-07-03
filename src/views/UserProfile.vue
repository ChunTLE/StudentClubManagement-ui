<template>
  <div class="profile-container">
    <el-card>
      <h2>个人信息</h2>
      <el-form :model="form" label-width="80px" class="profile-form">
        <el-form-item label="用户名">
          <el-input v-model="form.username" disabled />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="form.realName" disabled />
        </el-form-item>
        <el-form-item label="职位">
          <el-input v-model="form.position" disabled />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" show-password disabled />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="form.newPassword" type="password" show-password placeholder="请输入新密码" />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="form.confirmPassword" type="password" show-password placeholder="请再次输入新密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleChangePassword" :loading="loading">修改密码</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card class="activity-list-card">
      <h3>已报名活动</h3>
      <el-table :data="enrolledActivities" style="width: 100%; margin-top: 16px;">
        <el-table-column prop="activityTitle" label="活动名称" />
        <el-table-column prop="enrolledAt" label="报名时间">
          <template #default="scope">
            {{ formatDate(scope.row.enrolledAt) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import http from '../config/http'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const loading = ref(false)

const form = ref({
  username: userStore.username,
  realName: userStore.realName,
  position: getRoleName(userStore.role),
  password: '********',
  newPassword: '',
  confirmPassword: ''
})

const enrolledActivities = ref<any[]>([])
const activitiesMap = ref<Record<string, string>>({})

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  return dateStr.replace('T', ' ').slice(0, 16)
}

function getRoleName(role: string) {
  switch (role) {
    case 'ADMIN':
      return '管理员';
    case 'LEADER':
      return '部长';
    case 'MEMBER':
      return '干事';
    default:
      return '未知';
  }
}

async function fetchEnrolledActivities() {
  // 直接通过后端接口获取当前用户已报名活动
  const res = await http.get(`/activities/user/${userStore.userId}`)
  // 假设返回数组，每项有title和enrolledAt
  enrolledActivities.value = (res.data || []).map((item: any) => ({
    activityTitle: item.title,
    enrolledAt: item.createdAt
  }))
}

async function handleChangePassword() {
  if (!form.value.newPassword) {
    ElMessage.warning('请输入新密码')
    return
  }
  if (form.value.newPassword !== form.value.confirmPassword) {
    ElMessage.warning('两次输入的新密码不一致')
    return
  }
  loading.value = true
  try {
    await http.put(`/users/${userStore.userId}`, {
      password: form.value.newPassword
    })
    ElMessage.success('密码修改成功！')
    form.value.password = '********'
    form.value.newPassword = ''
    form.value.confirmPassword = ''
  } catch (e: any) {
    ElMessage.error(e?.message || '密码修改失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchEnrolledActivities()
})
</script>

<style scoped>
.profile-container {
  display: flex;
  gap: 32px;
  max-width: 1250px;
  margin: 40px auto;
  align-items: flex-start;
}
.profile-container > .el-card:first-child {
  flex-basis: 400px;
}
.profile-form {
  margin-top: 24px;
}
.activity-list-card {
  flex: 1;
}
</style> 