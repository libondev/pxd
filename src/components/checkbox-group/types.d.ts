import type { ComponentOption, ComponentValue } from '../../types/shared'

export interface CheckboxGroupProps {
  disabled?: boolean
  options?: ComponentOption[]
  modelValue: ComponentValue[]
}

export interface CheckboxGroupEmits {
  change: [NonNullable<CheckboxGroupProps['modelValue']>]
  'update:modelValue': [NonNullable<CheckboxGroupProps['modelValue']>]
}
