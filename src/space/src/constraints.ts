import type { ExtractPropTypes, PropType } from 'vue'

import type { Sizes } from '../../_types'

export const spaceProps = {
  /**
   * @zh 垂直排列
   */
  vertical: {
    type: Boolean,
    default: false
  },
  /**
   * @zh 间距
   */
  size: {
    type: String as PropType<Sizes>,
    default: ''
  },
  /**
   * @zh 对齐方式
   */
  align: {
    type: String as PropType<'start' | 'end' | 'center' | 'baseline'>,
    default: ''
  }
}

export type SpaceProps = ExtractPropTypes<typeof spaceProps>
