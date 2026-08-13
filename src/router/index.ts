import { createRouter, createWebHistory } from 'vue-router'
import BacboproDashboard from '@/views/BacboproDashboard.vue'
import BaccaratDashboard from '@/views/BaccaratDashboard.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'bacbopro',
      component: BacboproDashboard,
    },
    {
      path: '/legacy',
      name: 'legacy',
      component: BaccaratDashboard,
    },
  ],
})

export default router
