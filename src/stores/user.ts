import { ref } from 'vue'
import { defineStore } from 'pinia'
import http from '../config/http'
import defaultAvatar from '../assets/default-avatar.png'

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
    async loadAvatar() {
      if (!this.userId) {
        if(this.avatar && this.avatar!==defaultAvatar)URL.revokeObjectURL(this.avatar)
        this.avatar = defaultAvatar
        return
      }
      try {
        const res = await http.get(`/users/${this.userId}/avatar`, {
          responseType: 'blob',
          headers: {
            Authorization: this.token ? `Bearer ${this.token}` : ''
          }
        })
        if (res && res.data && res.data.type && res.data.type.startsWith('image/')) {
          if(this.avatar && this.avatar!==defaultAvatar)URL.revokeObjectURL(this.avatar)
          this.avatar = URL.createObjectURL(res.data)
        } else {
          if(this.avatar && this.avatar!==defaultAvatar)URL.revokeObjectURL(this.avatar)
          this.avatar = defaultAvatar
        }
      } catch {
        if(this.avatar && this.avatar!==defaultAvatar)URL.revokeObjectURL(this.avatar)
        this.avatar = defaultAvatar
      }
    },
    setUser(user: any) {
      this.userId = user.userId
      this.username = user.username
      this.realName = user.realName || ''
      this.role = user.role
      this.token = user.token
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
    key: 'user',
    storage: localStorage,
    pick: ['userId', 'username', 'realName', 'role', 'token']
  }
}) 