import routes from '~pages'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/introduction' },
    ...routes,
  ],
})

export default router
