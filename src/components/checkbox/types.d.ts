import type { ComponentLabel, ComponentOption, ComponentValue } from '../../types/shared'

export interface CheckboxProps {
  label?: ComponentLabel
  value?: ComponentValue
  disabled?: boolean
  required?: boolean
  modelValue?: ComponentValue | ComponentValue[]
  indeterminate?: boolean
}

export interface CheckboxEmits {
  change: [NonNullable<CheckboxProps['modelValue']>]
  'update:modelValue': [NonNullable<CheckboxProps['modelValue']>]
}

export interface CheckboxGroupProps {
  disabled?: boolean
  required?: boolean
  modelValue?: ComponentValue[]
  options?: ComponentOption[]
}

export interface CheckboxGroupEmits {
  change: [NonNullable<CheckboxGroupProps['modelValue']>]
  'update:modelValue': [NonNullable<CheckboxGroupProps['modelValue']>]
}
