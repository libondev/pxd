import type { ComponentSize, ComponentValue } from '../../types/shared'

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
