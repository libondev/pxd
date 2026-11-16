import type { ChangeDetails } from '../../types/shared/change'
import type { ComponentOption, ComponentValue } from '../../types/shared/props'

export interface RadioGroupProps {
  disabled?: boolean
  modelValue?: ComponentValue
  options?: ComponentOption[]
}

export interface RadioGroupEmits {
  change: [NonNullable<RadioGroupProps['modelValue']>, details?: ChangeDetails]
  'update:model-value': [NonNullable<RadioGroupProps['modelValue']>]
}
