import { useLoadingBar } from 'pxd'
import { isServer } from 'pxd/utils/is'
import { setupLayouts } from 'virtual:meta-layouts'
import { ViteSSG } from 'vite-ssg'
import { handleHotUpdate, routes } from 'vue-router/auto-routes'
import App from './App.vue'
import './styles/index.css'

export const createApp = ViteSSG(
  App,
  {
    base: import.meta.env.BASE_URL,
    routes: setupLayouts(routes),
    scrollBehavior(to) {
      if (to.hash) {
        return new Promise((resolve) => {
          requestAnimationFrame(() => {
            const el = document.querySelector<HTMLElement>(to.hash)

            if (!el) {
              return resolve({ left: 0, top: 0, behavior: 'instant' })
            }

            const header = document.querySelector<HTMLElement>('header')
            const offset = header?.offsetHeight ?? 0
            const top = el.getBoundingClientRect().top + window.scrollY - offset - 10

            resolve({ top, behavior: 'instant' })
          })
        })
      }

      return {
        top: 0,
        left: 0,
      }
    },
  },
  ({ router }) => {
    if (isServer()) {
      return
    }

    router.beforeEach((to, from, next) => {
      useLoadingBar.start('website')
      next()
    })

    router.afterEach(() => {
      useLoadingBar.finish('website')
    })

    router.onError(() => {
      useLoadingBar.finish('website')
    })

    // useViewTransition(router)

    if (import.meta.hot) {
      handleHotUpdate(router)
    }
  },
  { hydration: true },
)
