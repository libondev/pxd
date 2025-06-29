import { createApp, defineComponent, h } from 'vue'

type InstanceType<V> = V extends { new (...arg: any[]): infer X } ? X : never
type VM<V> = InstanceType<V> & { unmount: () => void }

export function useSetupWrapper<TResult>(
  setup: () => TResult,
): TResult & { unmount: () => void } {
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
