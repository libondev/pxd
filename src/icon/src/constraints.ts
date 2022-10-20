import type { ExtractPropTypes, PropType } from 'vue'

import type { CSSUnitValue } from '../../_types'
import type Icon from './icon.vue'

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
export type IconInstance = InstanceType<typeof Icon>
