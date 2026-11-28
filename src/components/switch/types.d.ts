import type { ChangeDetails, ChangeReason } from '../../types/shared/change'
import type { ComponentOption, ComponentSize } from '../../types/shared/props'

export type SwitchChangeReason = Extract<ChangeReason, 'api' | 'item-press'>

export interface SwitchProps {
  disabled?: boolean
  id?: string
  invalid?: boolean
  fullWidth?: boolean
  size?: ComponentSize
  options?: ComponentOption[]
  modelValue?: string | number
}

export type SwitchChangeValue = string | number

export interface SwitchEmits {
  change: [SwitchChangeValue, details: ChangeDetails<SwitchChangeReason>]
  'update:model-value': [SwitchChangeValue]
}
