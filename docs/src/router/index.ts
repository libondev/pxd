import routes from '~pages'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_PATH),
  routes: [
    { path: '/', redirect: '/introduction' },
    ...routes,
  ],
})

export default router
