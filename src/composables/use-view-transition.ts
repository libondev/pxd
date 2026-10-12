import type { RouteLocationNormalized, Router } from 'vue-router'
import { nextTick } from 'vue'
import { NOOP } from '../utils/event.js'
import { isServer } from '../utils/is.js'

type ShouldTransition = (to: RouteLocationNormalized, from: RouteLocationNormalized) => boolean

interface Options {
  shouldTransition?: ShouldTransition
}

interface Registration {
  count: number
  shouldTransition: ShouldTransition[]
  dispose: () => void
}

// Guards belong to the router, not to the call: a second call has to join the
// existing registration instead of stacking another transition onto every navigation.
const registrations = new WeakMap<Router, Registration>()

function release(router: Router, registration: Registration, shouldTransition?: ShouldTransition) {
  if (shouldTransition) {
    const index = registration.shouldTransition.indexOf(shouldTransition)

    if (index > -1) {
      registration.shouldTransition.splice(index, 1)
    }
  }

  if (--registration.count > 0) {
    return
  }

  registrations.delete(router)
  registration.dispose()
}

/**
 * Wraps router navigations in the View Transitions API so route changes animate
 * between the old and new view.
 *
 * Requires a browser with `document.startViewTransition` support and a router
 * that supports the View Transitions lifecycle. Returns a disposer that removes
 * the registered guards; it is a no-op when the API is unavailable. Calls for
 * the same router share one registration, removed once every caller has disposed.
 *
 * @param router The vue-router instance to attach the guards to.
 * @param options.shouldTransition Called with `(to, from)` before each navigation; `false` navigates without a transition. Each caller may pass one, and any of them declining skips the transition.
 * @returns A function that removes the guards.
 */
export function useViewTransition(router: Router, options: Options = {}): () => void {
  if (isServer() || !document.startViewTransition) {
    return NOOP
  }

  const { shouldTransition } = options
  const registered = registrations.get(router)

  if (registered) {
    registered.count++

    if (shouldTransition) {
      registered.shouldTransition.push(shouldTransition)
    }

    return () => release(router, registered, shouldTransition)
  }

  const registration: Registration = {
    count: 1,
    shouldTransition: shouldTransition ? [shouldTransition] : [],
    dispose: NOOP,
  }

  registrations.set(router, registration)

  const startViewTransition = document.startViewTransition.bind(document)

  let settle: (() => void) | undefined

  const stopBeforeResolve = router.beforeResolve((to, from) => {
    // Release a still-pending previous navigation so it cannot block forever
    settle?.()

    for (const predicate of registration.shouldTransition) {
      if (!predicate(to, from)) {
        return
      }
    }

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

  registration.dispose = () => {
    // Release an in-flight navigation first: dropping the guards also drops the
    // afterEach / onError hooks that would otherwise resolve it.
    settle?.()

    stopBeforeResolve()
    stopAfterEach()
    stopOnError()
  }

  return () => release(router, registration, shouldTransition)
}
