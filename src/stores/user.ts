import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userId: '',
    username: '',
    realName: '',
    role: '',
    token: '',
    avatar: ''
  }),
  actions: {
    setUser(user: any) {
      this.userId = user.userId
      this.username = user.username
      this.realName = user.realName || ''
      this.role = user.role
      this.token = user.token
      this.avatar = user.avatar || ''
    },
    clearUser() {
      this.userId = ''
      this.username = ''
      this.realName = ''
      this.role = ''
      this.token = ''
      this.avatar = ''
    },
    setToken(token: string) {
      this.token = token
    },
    setUsername(username: string) {
      this.username = username
    },
    setUserId(userId: string) {
      this.userId = userId
    },
    setRealName(realName: string) {
      this.realName = realName
    },
    setRole(role: string) {
      this.role = role
    }
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'user',
        storage: localStorage
      }
    ]
  }
}) 