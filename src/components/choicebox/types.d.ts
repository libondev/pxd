import type { ComponentLabel, ComponentOption, ComponentValue } from '../../types/shared'

interface Option extends ComponentOption {
  description?: string
}

export interface ChoiceboxProps {
  label?: ComponentLabel
  value?: ComponentValue
  disabled?: boolean
  description?: string
}

export interface ChoiceboxGroupProps {
  label?: ComponentLabel
  multiple?: boolean
  disabled?: boolean
  options?: Option[]
  modelValue?: ComponentValue | ComponentValue[]
}

export interface ChoiceboxGroupEmits {
  change: [NonNullable<ChoiceboxGroupProps['modelValue']>]
  'update:modelValue': [NonNullable<ChoiceboxGroupProps['modelValue']>]
}
