import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'
import UserProfile from '../views/UserProfile.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/Home.vue'),
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue'),
    },
    {
      path: '/clubs',
      name: 'ClubList',
      component: () => import('../views/ClubList.vue')
    },
    {
      path: '/finance',
      name: 'Finance',
      component: () => import('../views/Finance.vue')
    },
    {
      path: '/activities',
      name: 'ActivityList',
      component: () => import('../views/ActivityList.vue')
    },
    {
      path: '/departments',
      name: 'DepartmentList',
      component: () => import('../views/DepartmentList.vue')
    },
    {
      path: '/membership-review',
      name: 'MembershipReview',
      component: () => import('../views/MembershipReview.vue')
    },
    {
      path: '/enrollments',
      name: 'ActivityEnrollment',
      component: () => import('../views/ActivityEnrollment.vue')
    },
    {
      path: '/users',
      name: 'MemberShipList',
      component: () => import('../views/MemberShipList.vue')
    },
    {
      path: '/user-profile',
      name: 'UserProfile',
      component: UserProfile
    },
    {
      path: '/home',
      name: 'PieChartView',
      component: () => import('../views/PieChartView.vue')
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../views/Register.vue')
    },
  ],
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const token = userStore.token
  if (!token && to.name !== 'Login') {
    next({ name: 'Login' })
  } else {
    next()
  }
})

export default router
