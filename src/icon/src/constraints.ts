import type { ExtractPropTypes, PropType } from 'vue'

import type { CSSUnitValue } from '../../_types'

export const iconProps = {
  size: {
    type: String as PropType<CSSUnitValue>,
    default: null
  },
  color: {
    type: String,
    default: null
  }
}

export type IconProps = ExtractPropTypes<typeof iconProps>
