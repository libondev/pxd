import type { Router } from 'vue-router'
import { nextTick } from 'vue'
import { isServer } from '../utils/is.js'

/**
 * Wraps router navigations in the View Transitions API so route changes animate
 * between the old and new view.
 *
 * Requires a browser with `document.startViewTransition` support and a router
 * that supports the View Transitions lifecycle. Returns a disposer that removes
 * the registered guards; it is a no-op when the API is unavailable.
 *
 * @param router The vue-router instance to attach the guards to.
 * @returns A function that removes the guards.
 */
export function useViewTransition(router: Router): () => void {
  if (isServer() || !document.startViewTransition) {
    return () => {}
  }

  const startViewTransition = document.startViewTransition.bind(document)

  let settle: (() => void) | undefined

  const stopBeforeResolve = router.beforeResolve(() => {
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

    settle = () => {
      settle = undefined

      unblock()
      void nextTick(finish)
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

  const stopAfterEach = router.afterEach(() => {
    settle?.()
  })

  const stopOnError = router.onError(() => {
    settle?.()
  })

  return () => {
    settle = undefined

    stopBeforeResolve()
    stopAfterEach()
    stopOnError()
  }
}
