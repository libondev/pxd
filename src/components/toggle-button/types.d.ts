import type { ComponentSize, ComponentValue } from '../../types/shared'

export interface ToggleButtonProps {
  variant?: 'default' | 'outline'
  disabled?: boolean
  size?: ComponentSize
  value?: ComponentValue
  modelValue?: ComponentValue | ComponentValue[]
}

export interface ToggleButtonEmits {
  change: [NonNullable<CheckboxProps['modelValue']>]
  'update:modelValue': [NonNullable<CheckboxProps['modelValue']>]
}
