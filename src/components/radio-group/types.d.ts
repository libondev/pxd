import type { ComponentOption, ComponentValue } from '../../types/shared'

export interface RadioGroupProps {
  disabled?: boolean
  modelValue?: ComponentValue
  options?: ComponentOption[]
}

export interface RadioGroupEmits {
  change: [NonNullable<RadioGroupProps['modelValue']>]
  'update:modelValue': [NonNullable<RadioGroupProps['modelValue']>]
}
