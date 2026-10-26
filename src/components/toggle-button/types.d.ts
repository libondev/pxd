import type { ComponentText, ComponentSizeWithXxs, ComponentValue } from '../../types/shared/props'
import type { CheckboxProps } from '../checkbox/types'

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
  change: [NonNullable<CheckboxProps['modelValue']>]
  'update:model-value': [NonNullable<CheckboxProps['modelValue']>]
}
