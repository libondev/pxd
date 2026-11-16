import type { ChangeDetails } from '../../types/shared/change'
import type { ComponentOption, ComponentValue } from '../../types/shared/props'

type CheckboxGroupModelValue = ComponentValue | boolean

export interface CheckboxGroupProps {
  disabled?: boolean
  options?: ComponentOption[]
  modelValue?: CheckboxGroupModelValue[]
}

export interface CheckboxGroupEmits {
  change: [NonNullable<CheckboxGroupProps['modelValue']>, details: ChangeDetails]
  'update:model-value': [NonNullable<CheckboxGroupProps['modelValue']>]
}
