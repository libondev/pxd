import type { PropType } from 'vue'
import { defineComponent, provide } from 'vue'

import { globalSymbol } from '../_internal'
import type { Sizes } from '../_types'
import { withInstall } from '../_utils'

const Provider = defineComponent({
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
  }
})

export const CProvider = withInstall(Provider)
export default Provider
