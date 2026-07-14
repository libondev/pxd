import type { Router } from 'vue-router'

export function useViewTransition(router: Router) {
  if (typeof document === 'undefined' || !document.startViewTransition) {
    return
  }

  let activeTransition: ViewTransition | undefined
  let finishTransition: undefined | (() => void)
  let abortTransition: undefined | (() => void)

  function skipActiveTransition() {
    activeTransition?.skipTransition()
    finishTransition?.()

    activeTransition = undefined
    finishTransition = undefined
    abortTransition = undefined
  }

  router.beforeResolve(() => {
    skipActiveTransition()

    const promise = new Promise<void>((resolve, reject) => {
      finishTransition = resolve
      abortTransition = reject
    })

    let changeRoute: () => void
    const ready = new Promise<void>((resolve) => {
      changeRoute = resolve
    })

    const transition = document.startViewTransition!(() => {
      changeRoute()
      return promise
    })

    activeTransition = transition

    void transition.finished
      .catch(() => {})
      .then(() => {
        if (activeTransition !== transition) {
          return
        }

        activeTransition = undefined
        finishTransition = undefined
        abortTransition = undefined
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
