import type { ChangeDetails } from '../../types/shared/change'
import type { ComponentOption, ComponentSize } from '../../types/shared/props'

export interface SwitchProps {
  disabled?: boolean
  fullWidth?: boolean
  size?: ComponentSize
  options?: ComponentOption[]
  modelValue?: string | number
}

export interface SwitchEmits {
  change: [NonNullable<SwitchProps['modelValue']>, details: ChangeDetails]
  'update:model-value': [NonNullable<SwitchProps['modelValue']>]
}
