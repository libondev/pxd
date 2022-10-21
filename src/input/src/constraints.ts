import type { ExtractPropTypes, PropType } from 'vue'

import type Input from './input.vue'
import type { Sizes } from '../../_types'

export const inputProps = {
  /**
   * @zh 输入框值
   */
  modelValue: {
    type: [String, Number],
    default: ''
  },
  /**
   * @zh 输入框尺寸
   */
  size: {
    type: String as PropType<Sizes>,
    default: ''
  },
  /**
   * @zh 禁用
   */
  disabled: {
    type: Boolean,
    default: false
  },
  /**
   * @zh 只读
   */
  readonly: {
    type: Boolean,
    default: false
  },
  /**
   * @zh 是否移除展示省略号
   */
  ellipsis: {
    type: Boolean,
    default: true
  },
  /**
   * @zh 是否可以清空
   */
  clearable: {
    type: Boolean,
    default: true
  },
  /**
   * @zh 自定义提示语
   */
  placeholder: {
    type: String,
    default: 'Please enter...'
  }
}

export type InputProps = ExtractPropTypes<typeof inputProps>
export type InputInstance = InstanceType<typeof Input>
