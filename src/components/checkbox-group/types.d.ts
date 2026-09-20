import type { ComponentOption, ComponentValue } from '../../types/shared'

type CheckboxGroupModelValue = ComponentValue | boolean

export interface CheckboxGroupProps {
  disabled?: boolean
  options?: ComponentOption[]
  modelValue?: CheckboxGroupModelValue[]
}

export interface CheckboxGroupEmits {
  change: [NonNullable<CheckboxGroupProps['modelValue']>]
  'update:modelValue': [NonNullable<CheckboxGroupProps['modelValue']>]
}
