import type { ExtractPropTypes, PropType } from 'vue'

import type { CheckboxProps } from '../../checkbox/src/constraints'

export const checkboxGroupProps = {
  modelValue: {
    type: Array as PropType<Array<CheckboxProps['value']>>,
    default: () => []
  },
  /**
   * @zh 是否禁用
   */
  disabled: {
    type: Boolean,
    default: false
  }
}

export type CheckboxGroupProps = ExtractPropTypes<typeof checkboxGroupProps>

export interface CheckboxGroupContext {
  disabled: boolean
  onValueChange: (value: CheckboxProps['value']) => void
  getCheckedStatus: (value: CheckboxProps['value']) => boolean
}
