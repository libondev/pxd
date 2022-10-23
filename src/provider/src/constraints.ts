import type { ExtractPropTypes, PropType } from 'vue'

import type { Sizes } from '../../_types'

export const providerProps = {
  size: {
    type: String as PropType<Sizes>,
    default: null
  },
  zIndex: {
    type: Number,
    default: null
  }
}

export type ProviderProps = ExtractPropTypes<typeof providerProps>
