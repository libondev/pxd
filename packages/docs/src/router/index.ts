import { setupLayouts } from 'virtual:meta-layouts'
import { createRouter, createWebHistory } from 'vue-router'
import { handleHotUpdate, routes } from 'vue-router/auto-routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(routes),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }

    if (to.hash) {
      return new Promise((resolve) => {
        requestAnimationFrame(() => {
          const el = document.querySelector(to.hash) as HTMLElement | null

          if (!el) {
            return resolve({ left: 0, top: 0 })
          }

          const header = document.querySelector('header') as HTMLElement | null
          const offset = header?.offsetHeight ?? 0
          const top = el.getBoundingClientRect().top + window.scrollY - offset - 10

          resolve({ top, behavior: 'smooth' })
        })
      })
    }

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
