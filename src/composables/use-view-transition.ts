import { nextTick } from 'vue'
import { NOOP } from '../utils/event.js'
import { isServer } from '../utils/is.js'

interface RouteLocationNormalized {
  fullPath: string
  hash: string
  matched: unknown[]
  meta: Record<string, unknown>
  name: string | symbol | null | undefined
  params: Record<string, string | string[] | undefined>
  path: string
  query: Record<string, string | null | (string | null)[]>
  redirectedFrom?: RouteLocationNormalized
}

// Structural subset of the router API used here, compatible with vue-router.
interface Router {
  beforeResolve(guard: NavigationGuard): () => void
  afterEach(guard: NavigationHookAfter): () => void
  onError(handler: (error: unknown) => void): () => void
}

type NavigationGuard = (to: RouteLocationNormalized, from: RouteLocationNormalized) => Promise<void> | void

type NavigationHookAfter = (to: RouteLocationNormalized, from: RouteLocationNormalized) => void

type ShouldTransition = (to: RouteLocationNormalized, from: RouteLocationNormalized) => boolean

interface Options {
  shouldTransition?: ShouldTransition
}

interface Registration {
  count: number
  shouldTransition: ShouldTransition[]
  dispose: () => void
}

// Guards live on the router: repeat calls join the existing registration
// instead of stacking another transition onto every navigation.
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
 * Wraps route navigations in the View Transitions API.
 *
 * Returns a disposer; a no-op when the API is unavailable. Calls for the same
 * router share one registration, removed once every caller has disposed.
 *
 * @param router Router instance to attach the guards to.
 * @param options.shouldTransition Called with `(to, from)`; returning `false` skips the transition.
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

    // The browser rejects `ready` whenever it skips the transition; silence it
    void transition.ready.catch(NOOP)

    // Hidden documents skip the update callback entirely, so release via `finished`
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
    // Release an in-flight navigation first: dropping the guards also drops
    // the afterEach / onError hooks that would otherwise resolve it.
    settle?.()

    stopBeforeResolve()
    stopAfterEach()
    stopOnError()
  }

  return () => release(router, registration, shouldTransition)
}
