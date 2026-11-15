import type { ComponentText, ComponentSizeWithXxs, ComponentValue } from '../../types/shared/props'

type ToggleButtonModelValue = ComponentValue | boolean

export interface ToggleButtonProps {
  icon?: boolean
  size?: ComponentSizeWithXxs
  label?: ComponentText
  value?: ToggleButtonModelValue
  variant?: 'default' | 'ghost'
  disabled?: boolean
  modelValue?: ToggleButtonModelValue | ToggleButtonModelValue[]
}

export interface ToggleButtonEmits {
  change: [NonNullable<ToggleButtonProps['modelValue']>]
  'update:model-value': [NonNullable<ToggleButtonProps['modelValue']>]
}
