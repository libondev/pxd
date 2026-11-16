import type { ChangeDetails } from '../../types/shared/change'
import type { ComponentOption, ComponentValue } from '../../types/shared/props'

export interface RadioGroupProps {
  disabled?: boolean
  modelValue?: ComponentValue
  options?: ComponentOption[]
}

export type RadioGroupChangeValue = ComponentValue

export interface RadioGroupEmits {
  change: [RadioGroupChangeValue, details: ChangeDetails]
  'update:model-value': [RadioGroupChangeValue]
}
