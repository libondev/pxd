import type { InjectionKey } from 'vue'

import { defineComponent, h, provide } from 'vue'

import { mount } from './setup'

interface InjectionConfig {
  key: InjectionKey<any> | string
  value: any
}

export function useInjectedSetup<TResult>(
  setup: () => TResult,
  injections: InjectionConfig[] = [],
): TResult & { unmount: () => void } {
  let result!: TResult

  const Wrapper = defineComponent({
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
      return () => h(Wrapper)
    },
  })

  const mounted = mount(Provider)

  return {
    ...result,
    unmount: mounted.unmount,
  } as TResult & { unmount: () => void }
}
