import type { ChangeDetails } from '../../types/shared/change'
import type { ComponentText } from '../../types/shared/props'

export interface SwitchItemProps {
  label?: ComponentText
  value: string | number
  disabled?: boolean
  modelValue?: string | number
}

export type SwitchItemChangeValue = string | number

export interface SwitchItemEmits {
  change: [SwitchItemChangeValue, details: ChangeDetails]
  'update:model-value': [SwitchItemChangeValue]
}
