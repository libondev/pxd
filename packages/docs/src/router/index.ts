import { createRouter, createWebHashHistory } from 'vue-router'
import { handleHotUpdate, routes } from 'vue-router/auto-routes'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return {
      top: 0,
      left: 0,
    }
  },
})

if (import.meta.hot) {
  handleHotUpdate(router)
}

export default router
