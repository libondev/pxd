import type { ExtractPropTypes } from 'vue'
import type Switch from './switch.vue'

export const switchProps = {
  modelValue: {
    type: [String, Number, Boolean],
    default: false
  },
  /**
   * @zh 按钮的尺寸
   */
  size: {
    type: [String, Number],
    default: null
  },
  /**
   * @zh 是否禁用
   */
  disabled: {
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
   * @zh 真值，用于切换为激活时的值
   */
  activeValue: {
    type: [String, Number, Boolean],
    default: true
  },
  /**
   * @zh 假值，用于切换为未激活时的值
   */
  inactiveValue: {
    type: [String, Number, Boolean],
    default: false
  },
  /**
   * @zh 激活时的背景颜色
   */
  activeColor: {
    type: String,
    default: null
  },
  /**
   * @zh 未激活时的背景颜色
   */
  inactiveColor: {
    type: String,
    default: null
  }
}

export type SwitchProps = ExtractPropTypes<typeof switchProps>
export type SwitchInstance = InstanceType<typeof Switch>
