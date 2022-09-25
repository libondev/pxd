import type { PropType } from 'vue'
import { defineComponent, provide } from 'vue'

import { globalSymbol } from '../_internal/injectKeys'
import type { Sizes } from '../_types/props'

export const CProvider = defineComponent({
  name: 'CProvider',
  props: {
    size: {
      type: String as PropType<Sizes>,
      default: 'medium'
    }
  },
  setup (props, { slots }) {
    provide(globalSymbol, props)

    return () => slots.default?.()
  }
})