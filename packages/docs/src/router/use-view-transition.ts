import type { RouteLocationNormalized, Router } from 'vue-router'
import { nextTick } from 'vue'

export function useViewTransition(router: Router): () => void {
  if (typeof document === 'undefined' || !document.startViewTransition) {
    return () => {}
  }

  const startViewTransition = document.startViewTransition.bind(document)

  let pendingTo: RouteLocationNormalized | undefined
  let settle: (() => void) | undefined

  const stopBeforeResolve = router.beforeResolve((to) => {
    // Release a still-pending previous navigation so it cannot block forever
    settle?.()

    let unblock!: () => void
    let finish!: () => void

    // Block the navigation so startViewTransition captures the old state first
    const blocked = new Promise<void>((resolve) => {
      unblock = resolve
    })

    // Keep the transition alive until Vue finishes the DOM update
    const rendered = new Promise<void>((resolve) => {
      finish = resolve
    })

    pendingTo = to

    settle = () => {
      // Settle only the transition owned by this navigation. When navigations
      // happen in quick succession, a cancelled one's afterEach may fire after
      // the next beforeResolve has already installed its own `settle`.
      if (pendingTo !== to) {
        return
      }

      settle = undefined
      pendingTo = undefined

      unblock()
      nextTick(finish)
    }

    const transition = startViewTransition(() => {
      unblock()
      return rendered
    })

    // When the document is already hidden the spec skips the transition without
    // scheduling the update callback. `finished` still fulfills in that case, so
    // use it to release the navigation instead of letting it hang.
    void transition.finished.then(unblock, unblock)

    return blocked
  })

  const stopAfterEach = router.afterEach((to) => {
    if (to === pendingTo) {
      settle?.()
    }
  })

  const stopOnError = router.onError((_error, to) => {
    if (to === pendingTo) {
      settle?.()
    }
  })

  return () => {
    settle = undefined
    pendingTo = undefined

    stopBeforeResolve()
    stopAfterEach()
    stopOnError()
  }
}
