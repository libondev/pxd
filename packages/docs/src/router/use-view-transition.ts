import type { Router } from 'vue-router'

export function useViewTransition(router: Router) {
  if (!document.startViewTransition) {
    return
  }

  let finishTransition: undefined | (() => void)
  let abortTransition: undefined | (() => void)

  router.beforeResolve(() => {
    const promise = new Promise<void>((resolve, reject) => {
      finishTransition = resolve
      abortTransition = reject
    })

    let changeRoute: () => void
    const ready = new Promise<void>((resolve) => (changeRoute = resolve))

    const transition = document.startViewTransition!(() => {
      changeRoute()

      return promise
    })

    transition.finished.then(() => {
      abortTransition = undefined
      finishTransition = undefined
    })

    return ready
  })

  router.afterEach(() => {
    finishTransition?.()
    finishTransition = undefined
  })

  router.onError(() => {
    abortTransition?.()
    abortTransition = undefined
  })
}
