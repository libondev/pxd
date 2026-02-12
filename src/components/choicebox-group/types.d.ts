import type { ComponentLabel, ComponentValue } from '../../types/shared'

export interface ChoiceboxGroupProps {
  gap?: ResponsiveValue<number | string>
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
