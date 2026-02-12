import type { ComponentLabel, ComponentValue } from '../../types/shared'

export interface CheckboxProps {
  label?: ComponentLabel
  value?: ComponentValue
  disabled?: boolean
  modelValue?: ComponentValue | ComponentValue[]
  indeterminate?: boolean
}

export interface CheckboxEmits {
  change: [NonNullable<CheckboxProps['modelValue']>]
  'update:modelValue': [NonNullable<CheckboxProps['modelValue']>]
}
