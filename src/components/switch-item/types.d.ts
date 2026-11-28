import type { ChangeDetails, ChangeReason } from '../../types/shared/change'
import type { ComponentText } from '../../types/shared/props'

export type SwitchItemChangeReason = Extract<ChangeReason, 'item-press'>

export interface SwitchItemProps {
  label?: ComponentText
  value: string | number
  disabled?: boolean
  modelValue?: string | number
}

export type SwitchItemChangeValue = string | number

export interface SwitchItemEmits {
  change: [SwitchItemChangeValue, details: ChangeDetails<SwitchItemChangeReason>]
  'update:model-value': [SwitchItemChangeValue]
}
