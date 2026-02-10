import type { ComponentLabel, ComponentOption, ComponentSize } from '../../types/shared'

export interface SwitchProps {
  label?: ComponentLabel
  value: string | number
  disabled?: boolean
  required?: boolean
}

export interface SwitchGroupProps {
  disabled?: boolean
  required?: boolean
  fullWidth?: boolean
  size?: ComponentSize
  options?: ComponentOption[]
  modelValue?: string | number
}

export interface SwitchGroupEmits {
  change: [NonNullable<SwitchGroupProps['modelValue']>]
  'update:modelValue': [NonNullable<SwitchGroupProps['modelValue']>]
}
