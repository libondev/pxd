import type { ExtractPropTypes } from 'vue'

export const checkboxProps = {
  modelValue: {
    type: Boolean
  },
  value: {
    type: [String, Number, Boolean, Array, Object],
    default: ''
  },
  /**
   * @zh 是否禁用
   */
  disabled: {
    type: Boolean,
    default: false
  },
  /**
   * @zh 半选
   */
  indeterminate: {
    type: Boolean,
    default: false
  }
}

export type CheckboxProps = ExtractPropTypes<typeof checkboxProps>
