import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../App.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue'),
    },
    {
      path: '/clubs',
      name: 'ClubList',
      component: () => import('../views/ClubList.vue')
    },
    {
      path: '/activities',
      name: 'ActivityList',
      component: () => import('../views/ActivityList.vue')
    },
  ],
})

export default router
