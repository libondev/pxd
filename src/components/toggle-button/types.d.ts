import type { ChangeDetails, ChangeReason } from '../../types/shared/change'
import type { ComponentText, ComponentSizeWithXxs, ComponentValue } from '../../types/shared/props'

export type ToggleButtonChangeReason = Extract<ChangeReason, 'api' | 'item-press'>

export type ToggleButtonModelValue = ComponentValue | boolean

export interface ToggleButtonProps {
  iconOnly?: boolean
  size?: ComponentSizeWithXxs
  label?: ComponentText
  value?: ToggleButtonModelValue
  variant?: 'default' | 'ghost'
  disabled?: boolean
  modelValue?: ToggleButtonModelValue | ToggleButtonModelValue[]
}

export type ToggleButtonChangeValue = ToggleButtonModelValue | ToggleButtonModelValue[]

export interface ToggleButtonEmits {
  change: [ToggleButtonChangeValue, details: ChangeDetails<ToggleButtonChangeReason>]
  'update:model-value': [ToggleButtonChangeValue]
}
