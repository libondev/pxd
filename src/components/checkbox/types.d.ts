import type { ComponentLabel, ComponentValue, ComponentShape } from '../../types/shared'

export interface CheckboxProps {
  label?: ComponentLabel
  value?: ComponentValue
  shape?: ComponentShape
  disabled?: boolean
  modelValue?: ComponentValue | ComponentValue[]
  indeterminate?: boolean
}

export interface CheckboxEmits {
  change: [NonNullable<CheckboxProps['modelValue']>]
  'update:modelValue': [NonNullable<CheckboxProps['modelValue']>]
}
