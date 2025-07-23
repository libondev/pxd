import type { ComponentLabel, ComponentOption, ComponentValue } from '../shared'

export interface CheckboxGroupProps {
  disabled?: boolean
  required?: boolean
  modelValue?: ComponentValue[]
  options?: ComponentOption[]
}

export interface CheckboxProps {
  label?: ComponentLabel
  value?: ComponentValue
  disabled?: boolean
  required?: boolean
  modelValue?: ComponentValue | ComponentValue[]
  indeterminate?: boolean
}
