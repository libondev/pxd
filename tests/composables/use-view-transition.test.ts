import type { Router } from 'vue-router'
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test'
import { useViewTransition } from '../../src/composables/use-view-transition'

interface MockTransition {
  /** Whether the promise returned by the update callback has settled. */
  updateCallbackSettled: () => boolean
  finished: Promise<void>
}

function createRouter() {
  const beforeResolveHooks: ((to: unknown) => unknown)[] = []
  const afterEachHooks: ((to: unknown) => unknown)[] = []
  const onErrorHooks: ((error: unknown, to: unknown) => unknown)[] = []

  function add<T>(list: T[], hook: T): () => void {
    list.push(hook)
    return () => {
      const i = list.indexOf(hook)
      if (i > -1) {
        list.splice(i, 1)
      }
    }
  }

  return {
    counts: {
      beforeResolve: () => beforeResolveHooks.length,
      afterEach: () => afterEachHooks.length,
      onError: () => onErrorHooks.length,
    },
    beforeResolve: (fn: (to: unknown) => unknown) => add(beforeResolveHooks, fn),
    afterEach: (fn: (to: unknown) => unknown) => add(afterEachHooks, fn),
    onError: (fn: (error: unknown, to: unknown) => unknown) => add(onErrorHooks, fn),
    runBeforeResolve: (to: unknown) => beforeResolveHooks.map((fn) => fn(to)),
    runAfterEach: (to: unknown) => afterEachHooks.forEach((fn) => fn(to)),
    runOnError: (error: unknown, to: unknown) => onErrorHooks.forEach((fn) => fn(error, to)),
  }
}

/** Lets queued microtasks and one macrotask drain. */
function tick() {
  return new Promise((resolve) => setTimeout(resolve))
}

/**
 * Models the real lifecycle: the update callback runs asynchronously, and the
 * promise it returns is what holds the transition open. A skipped transition
 * never runs its callback but still fulfills `finished`.
 */
function mockStartViewTransition(options: { runsCallback?: boolean } = {}) {
  const { runsCallback = true } = options
  const transitions: MockTransition[] = []

  document.startViewTransition = ((callback: () => unknown) => {
    let settled = false
    let markSettled!: () => void
    const settledPromise = new Promise<void>((resolve) => {
      markSettled = resolve
    })

    const finished = runsCallback ? settledPromise : Promise.resolve()
    finished.catch(() => {})

    if (runsCallback) {
      // The real API schedules the update callback asynchronously
      const invoke = async () => {
        try {
          await callback()
        } finally {
          settled = true
          markSettled()
        }
      }

      void Promise.resolve().then(invoke)
    }

    transitions.push({
      updateCallbackSettled: () => settled,
      finished,
    })

    return { finished }
  }) as unknown as typeof document.startViewTransition

  return transitions
}

const originalStartViewTransition = document.startViewTransition?.bind(document)

describe('useViewTransition', () => {
  beforeEach(() => {
    mockStartViewTransition()
  })

  afterEach(() => {
    if (originalStartViewTransition) {
      document.startViewTransition = originalStartViewTransition
    } else {
      delete (document as Partial<Document>).startViewTransition
    }
  })

  it('should register the navigation guards and return a disposer', () => {
    const router = createRouter()

    expect(router.counts.beforeResolve()).toBe(0)

    const stop = useViewTransition(router as unknown as Router)

    expect(router.counts.beforeResolve()).toBe(1)
    expect(router.counts.afterEach()).toBe(1)
    expect(router.counts.onError()).toBe(1)

    stop()

    expect(router.counts.beforeResolve()).toBe(0)
    expect(router.counts.afterEach()).toBe(0)
    expect(router.counts.onError()).toBe(0)
  })

  it('should return a no-op disposer when the API is unavailable', () => {
    delete (document as Partial<Document>).startViewTransition

    const router = createRouter()
    const stop = useViewTransition(router as unknown as Router)

    expect(router.counts.beforeResolve()).toBe(0)
    expect(() => stop()).not.toThrow()
  })

  it('should keep the transition alive until the DOM update settles', async () => {
    const transitions = mockStartViewTransition()
    const router = createRouter()

    useViewTransition(router as unknown as Router)

    const to = { fullPath: '/guide' }
    const [blocked] = router.runBeforeResolve(to) as [Promise<void>]

    let navigationSettled = false
    void blocked.then(() => {
      navigationSettled = true
    })

    // The API schedules the update callback asynchronously
    await tick()
    expect(navigationSettled).toBe(true)

    // The callback returns a promise that afterEach resolves, so the transition
    // must stay open: releasing it earlier would capture a stale DOM state
    expect(transitions[0].updateCallbackSettled()).toBe(false)

    router.runAfterEach(to)
    await tick()

    expect(transitions[0].updateCallbackSettled()).toBe(true)
  })

  it('should release the navigation when the document is hidden', async () => {
    mockStartViewTransition({ runsCallback: false })
    const router = createRouter()

    useViewTransition(router as unknown as Router)

    const to = { fullPath: '/components' }
    const [blocked] = router.runBeforeResolve(to) as [Promise<void>]

    let settled = false
    void blocked.then(() => {
      settled = true
    })

    // The spec skips the transition without ever scheduling the update callback.
    // Relying on it alone would leave the navigation hanging forever.
    await tick()

    expect(settled).toBe(true)
  })

  it('should settle once when a cancelled navigation reports afterEach late', async () => {
    const transitions = mockStartViewTransition()
    const router = createRouter()

    useViewTransition(router as unknown as Router)

    const stale = { fullPath: '/stale' }
    const current = { fullPath: '/current' }

    router.runBeforeResolve(stale)
    router.runBeforeResolve(current)
    await tick()

    router.runAfterEach(stale)
    await tick()
    expect(transitions[1].updateCallbackSettled()).toBe(true)

    router.runAfterEach(current)
    await tick()
    expect(transitions[1].updateCallbackSettled()).toBe(true)
  })

  it('should settle on navigation errors', async () => {
    const transitions = mockStartViewTransition()
    const router = createRouter()

    useViewTransition(router as unknown as Router)

    const to = { fullPath: '/missing' }
    router.runBeforeResolve(to)
    await Promise.resolve()

    expect(transitions[0].updateCallbackSettled()).toBe(false)

    router.runOnError(new Error('chunk load failed'), to)
    await tick()

    expect(transitions[0].updateCallbackSettled()).toBe(true)
  })

  it('should not start a transition after being disposed', () => {
    const transitions = mockStartViewTransition()
    const router = createRouter()

    const stop = useViewTransition(router as unknown as Router)
    stop()

    router.runBeforeResolve({ fullPath: '/guide' })

    expect(transitions).toHaveLength(0)
  })
})
