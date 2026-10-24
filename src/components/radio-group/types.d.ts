import type { ComponentOption, ComponentValue } from '../../types/shared/props'

export interface RadioGroupProps {
  disabled?: boolean
  modelValue?: ComponentValue
  options?: ComponentOption[]
}

export interface RadioGroupEmits {
  change: [NonNullable<RadioGroupProps['modelValue']>]
  'update:model-value': [NonNullable<RadioGroupProps['modelValue']>]
}
