import type { ChangeDetails } from '../../types/shared/change'
import type { ComponentText, ComponentSizeWithXxs, ComponentValue } from '../../types/shared/props'

export type ToggleButtonModelValue = ComponentValue | boolean

export interface ToggleButtonProps {
  icon?: boolean
  size?: ComponentSizeWithXxs
  label?: ComponentText
  value?: ToggleButtonModelValue
  variant?: 'default' | 'ghost'
  disabled?: boolean
  modelValue?: ToggleButtonModelValue | ToggleButtonModelValue[]
}

export type ToggleButtonChangeValue = ToggleButtonModelValue | ToggleButtonModelValue[]

export interface ToggleButtonEmits {
  change: [ToggleButtonChangeValue, details: ChangeDetails]
  'update:model-value': [ToggleButtonChangeValue]
}
