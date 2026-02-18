import { useLoadingBar } from 'pxd'
import { setupLayouts } from 'virtual:meta-layouts'
import { createRouter, createWebHistory } from 'vue-router'
import { handleHotUpdate, routes } from 'vue-router/auto-routes'

import { useViewTransition } from './use-view-transition'

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
          const el = document.querySelector<HTMLElement>(to.hash)

          if (!el) {
            return resolve({ left: 0, top: 0 })
          }

          const header = document.querySelector<HTMLElement>('header')
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

router.beforeEach((to, from, next) => {
  useLoadingBar.start('website')
  next()
})

router.afterEach(() => {
  useLoadingBar.finish('website')
})

useViewTransition(router)

if (import.meta.hot) {
  handleHotUpdate(router)
}

export default router
