import type { ComponentLabel, ComponentOption, ComponentValue } from '../../types/shared'

export interface RadioProps {
  label?: ComponentLabel
  value: ComponentValue
  disabled?: boolean
  modelValue?: ComponentValue
}

export interface RadioEmits {
  change: [NonNullable<RadioProps['modelValue']>]
  'update:modelValue': [NonNullable<RadioProps['modelValue']>]
}

export interface RadioGroupProps {
  disabled?: boolean
  modelValue?: ComponentValue
  options?: ComponentOption[]
}

export interface RadioGroupEmits {
  change: [NonNullable<RadioGroupProps['modelValue']>]
  'update:modelValue': [NonNullable<RadioGroupProps['modelValue']>]
}
