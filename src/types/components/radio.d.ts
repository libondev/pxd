import type { ComponentOption, ComponentValue } from '../shared'

export interface RadioGroupProps {
  disabled?: boolean
  required?: boolean
  modelValue?: ComponentValue
  options?: ComponentOption[]
}

export interface RadioProps {
  label?: ComponentLabel
  value: ComponentValue
  required?: boolean
  disabled?: boolean
  modelValue?: ComponentValue
}
