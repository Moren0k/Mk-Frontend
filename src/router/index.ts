import { createRouter, createWebHistory } from 'vue-router'
import BacboproDashboard from '@/views/BacboproDashboard.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'bacbopro',
      component: BacboproDashboard,
    },
  ],
})

export default router
