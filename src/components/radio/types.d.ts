import type { ComponentLabel, ComponentValue } from '../../types/shared/props'

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
