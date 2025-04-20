import type { InjectionKey } from 'vue'
import { createApp, defineComponent, h, provide } from 'vue'

type InstanceType<V> = V extends { new (...arg: any[]): infer X } ? X : never
type VM<V> = InstanceType<V> & { unmount: () => void }

interface InjectionConfig {
  key: InjectionKey<any> | string
  value: any
}

export function useInjectedSetup<TResult>(
  setup: () => TResult,
  injections: InjectionConfig[] = [],
): TResult & { unmount: () => void } {
  let result!: TResult

  const Comp = defineComponent({
    setup() {
      result = setup()
      return () => h('div')
    },
  })

  const Provider = defineComponent({
    setup() {
      injections.forEach(({ key, value }) => {
        provide(key, value)
      })
      return () => h(Comp)
    },
  })

  const mounted = mount(Provider)

  return {
    ...result,
    unmount: mounted.unmount,
  } as TResult & { unmount: () => void }
}

function mount<V>(Comp: V) {
  const el = document.createElement('div')
  const app = createApp(Comp as any)
  const unmount = () => app.unmount()
  const comp = app.mount(el) as any as VM<V>
  comp.unmount = unmount
  return comp
}
