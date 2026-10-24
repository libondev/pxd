import type { ComponentOption, ComponentValue } from '../../types/shared/props'

type CheckboxGroupModelValue = ComponentValue | boolean

export interface CheckboxGroupProps {
  disabled?: boolean
  options?: ComponentOption[]
  modelValue?: CheckboxGroupModelValue[]
}

export interface CheckboxGroupEmits {
  change: [NonNullable<CheckboxGroupProps['modelValue']>]
  'update:model-value': [NonNullable<CheckboxGroupProps['modelValue']>]
}
