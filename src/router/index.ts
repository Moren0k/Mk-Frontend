import { createRouter, createWebHistory } from 'vue-router'
import BacboproDashboard from '@/views/BacboproDashboard.vue'
import RiskCalculatorView from '@/views/RiskCalculatorView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'bacbopro',
      component: BacboproDashboard,
    },
    {
      path: '/herramientas',
      name: 'herramientas',
      component: RiskCalculatorView,
    },
  ],
})

export default router
