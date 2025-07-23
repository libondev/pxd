import type { ComponentLabel, ComponentOption, ComponentValue } from '../shared'

interface Option extends ComponentOption {
  description?: string
}

export interface ChoiceboxGroupProps {
  label?: ComponentLabel
  multiple?: boolean
  required?: boolean
  disabled?: boolean
  options?: Option[]
  modelValue?: ComponentValue | ComponentValue[]
}

export interface ChoiceboxProps {
  label?: ComponentLabel
  value?: ComponentValue
  disabled?: boolean
  required?: boolean
  description?: string
}
