import type { ExtractPropTypes, PropType } from 'vue'
import { NATIVE_BUTTON_TYPES, VARIANTS } from '../../_internal'
import type { NativeButton, Sizes, VariantState } from '../../_types'

export const buttonProps = {
  /**
   * @zh Button 状态
   */
  status: {
    type: String as PropType<VariantState>,
    default: 'default',
    validator: (value: VariantState) => VARIANTS.includes(value)
  },
  /**
   * @zh 按钮的原生类型
   */
  type: {
    type: String as PropType<NativeButton>,
    default: 'button',
    validator: (value: NativeButton) => NATIVE_BUTTON_TYPES.includes(value)
  },
  /**
   * @zh 按钮的尺寸
   */
  size: {
    type: String as PropType<Sizes>,
    default: ''
  },
  /**
   * @zh 朴素按钮
   */
  plain: {
    type: Boolean,
    default: false
  },
  /**
   * @zh 幽灵按钮，无边框、背景色
   */
  ghost: {
    type: Boolean,
    default: false
  },
  /**
   * @zh 是否处于加载中
   */
  loading: {
    type: Boolean,
    default: false
  },
  /**
   * @zh 禁用按钮
   */
  disabled: {
    type: Boolean,
    default: false
  }
}

export type ButtonProps = ExtractPropTypes<typeof buttonProps>
