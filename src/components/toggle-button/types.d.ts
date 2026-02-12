import type { ComponentSize, ComponentValue, ComponentOption } from '../../types/shared'

export interface ToggleButtonProps {
  variant?: 'ghost' | 'outline'
  disabled?: boolean
  label?: ComponentLabel
  size?: ComponentSize
  value?: ComponentValue
  modelValue?: ComponentValue | ComponentValue[]
}

export interface ToggleButtonEmits {
  change: [NonNullable<CheckboxProps['modelValue']>]
  'update:modelValue': [NonNullable<CheckboxProps['modelValue']>]
}

export interface ToggleButtonGroupProps {
  gap?: number | string
  size?: ComponentSize
  disabled?: boolean
  options?: ComponentOption[]
  variant?: 'ghost' | 'outline'
  modelValue?: ComponentValue | ComponentValue[]
}

export interface ToggleButtonGroupEmits {
  change: [NonNullable<CheckboxProps['modelValue']>]
  'update:modelValue': [NonNullable<CheckboxProps['modelValue']>]
}
