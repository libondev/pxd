import type {
  ComponentSizeWithXxs,
  ComponentValue,
  ComponentOption,
  ResponsiveValue,
} from '../../types/shared/props'
import type { CheckboxProps } from '../checkbox/types'

export interface ToggleButtonGroupProps {
  gap?: ResponsiveValue<string | number>
  size?: ComponentSizeWithXxs
  disabled?: boolean
  multiple?: boolean
  options?: ComponentOption[]
  variant?: 'default' | 'ghost'
  modelValue?: ComponentValue | ComponentValue[]
}

export interface ToggleButtonGroupEmits {
  change: [NonNullable<CheckboxProps['modelValue']>]
  'update:model-value': [NonNullable<CheckboxProps['modelValue']>]
}
