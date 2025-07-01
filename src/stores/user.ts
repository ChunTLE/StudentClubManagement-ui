import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(null)
  const username = ref<string | null>(null)
  const userId = ref<number | null>(null)
  const realName = ref<string | null>(null)
  const role = ref<string | null>(null)

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function removeToken() {
    token.value = null
    localStorage.removeItem('token')
  }

  function setUsername(name: string) {
    username.value = name
  }

  function setUserId(id: number) {
    userId.value = id
  }

  function setRealName(name: string) {
    realName.value = name
  }

  function setRole(r: string) {
    role.value = r
  }

  // 初始化时从localStorage恢复token
  if (localStorage.getItem('token')) {
    token.value = localStorage.getItem('token')
  }

  return { token, username, userId, realName, role, setToken, removeToken, setUsername, setUserId, setRealName, setRole }
}) 