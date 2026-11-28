import type { ChangeDetails, ChangeReason } from '../../types/shared/change'
import type {
  ComponentSizeWithXxs,
  ComponentValue,
  ComponentOption,
  ResponsiveValue,
} from '../../types/shared/props'

export type ToggleButtonGroupChangeReason = Extract<ChangeReason, 'api' | 'item-press'>

export interface ToggleButtonGroupProps {
  gap?: ResponsiveValue<string | number>
  size?: ComponentSizeWithXxs
  disabled?: boolean
  multiple?: boolean
  options?: ComponentOption[]
  variant?: 'default' | 'ghost'
  modelValue?: ComponentValue | ComponentValue[]
}

export type ToggleButtonGroupChangeValue = ComponentValue | ComponentValue[]

export interface ToggleButtonGroupEmits {
  change: [ToggleButtonGroupChangeValue, details: ChangeDetails<ToggleButtonGroupChangeReason>]
  'update:model-value': [ToggleButtonGroupChangeValue]
}
