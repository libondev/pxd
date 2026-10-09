import { vi } from 'vite-plus/test'
import { createApp, defineComponent, effectScope, h } from 'vue'

type InstanceType<V> = V extends { new (...arg: any[]): infer X } ? X : never
type VM<V> = InstanceType<V> & { unmount: () => void }

export function runWithScope<T>(fn: () => T): { result: T; stop: () => void } {
  const scope = effectScope()
  const result = scope.run(fn)!
  return { result, stop: () => scope.stop() }
}

export function useSetupWrapper<TResult>(setup: () => TResult): TResult & { unmount: () => void } {
  let result!: TResult

  const Wrapper = defineComponent({
    setup() {
      result = setup()
      return () => h('div')
    },
  })

  const mounted = mount(Wrapper)

  return {
    ...result,
    unmount: mounted.unmount,
  } as TResult & { unmount: () => void }
}

// Export mount function for reuse in other helpers
export function mount<V>(Comp: V) {
  const el = document.createElement('div')
  const app = createApp(Comp as any)
  const unmount = () => app.unmount()
  const comp = app.mount(el) as any as VM<V>
  comp.unmount = unmount
  return comp
}

// Export types for reuse
export type { InstanceType, VM }

/** happy-dom delivers neither observer callback; the recorded callback is fired by hand. */
function installObserverMock(name: 'ResizeObserver' | 'MutationObserver') {
  type Callback = (entries: unknown[], observer: unknown) => void

  const instances: { callback: Callback; targets: Set<Element> }[] = []

  vi.stubGlobal(
    name,
    class MockObserver {
      targets = new Set<Element>()
      callback: Callback

      constructor(callback: Callback) {
        this.callback = callback
        instances.push(this)
      }

      observe(el: Element) {
        this.targets.add(el)
      }

      unobserve(el: Element) {
        this.targets.delete(el)
      }

      disconnect() {
        this.targets.clear()
      }
    },
  )

  return {
    get count() {
      return instances.length
    },
    observed() {
      return Array.from(instances).flatMap(({ targets }) => Array.from(targets))
    },
    fireAll() {
      for (const { callback, targets } of instances) {
        if (!targets.size) {
          continue
        }

        callback(
          Array.from(targets).map((target) => ({ target })),
          {},
        )
      }
    },
  }
}

export function installResizeObserverMock() {
  return installObserverMock('ResizeObserver')
}

export function installMutationObserverMock() {
  return installObserverMock('MutationObserver')
}
