import type { App, PropType } from 'vue'
import { defineComponent, provide } from 'vue'

import { globalSymbol } from '../_internal'
import type { Sizes } from '../_types'

const CProvider = defineComponent({
  name: 'CProvider',
  props: {
    size: {
      type: String as PropType<Sizes>
    },
    zIndex: {
      type: Number
    }
  },
  setup (props, { slots }) {
    provide(globalSymbol, props)

    return () => slots.default?.()
  },
  install (app: App) {
    app.component(CProvider.name, CProvider)
  }
})

export { CProvider, CProvider as default }
