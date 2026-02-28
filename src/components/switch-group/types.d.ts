import type { ComponentOption, ComponentSize } from '../../types/shared'

export interface SwitchGroupProps {
  disabled?: boolean
  fullWidth?: boolean
  size?: ComponentSize
  options?: ComponentOption[]
  modelValue?: string | number
}

export interface SwitchGroupEmits {
  change: [NonNullable<SwitchGroupProps['modelValue']>]
  'update:modelValue': [NonNullable<SwitchGroupProps['modelValue']>]
}
