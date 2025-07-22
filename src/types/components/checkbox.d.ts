import type { ComponentOption, ComponentValue } from './shared'

export interface CheckboxGroupProps {
  disabled?: boolean
  required?: boolean
  modelValue?: ComponentValue[]
  options?: ComponentOption[]
}
