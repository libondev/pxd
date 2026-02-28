import type {
  ComponentSize,
  ComponentValue,
  ComponentOption,
  ResponsiveValue,
} from '../../types/shared'
import type { CheckboxProps } from '../checkbox/types'

export interface ToggleButtonGroupProps {
  gap?: ResponsiveValue<string | number>
  size?: ComponentSize
  disabled?: boolean
  multiple?: boolean
  options?: ComponentOption[]
  variant?: 'ghost' | 'outline'
  modelValue?: ComponentValue | ComponentValue[]
}

export interface ToggleButtonGroupEmits {
  change: [NonNullable<CheckboxProps['modelValue']>]
  'update:modelValue': [NonNullable<CheckboxProps['modelValue']>]
}
