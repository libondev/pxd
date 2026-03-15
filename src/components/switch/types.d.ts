import type { ComponentOption, ComponentSize } from '../../types/shared'

export interface SwitchProps {
  disabled?: boolean
  fullWidth?: boolean
  size?: ComponentSize
  options?: ComponentOption[]
  modelValue?: string | number
}

export interface SwitchEmits {
  change: [NonNullable<SwitchProps['modelValue']>]
  'update:modelValue': [NonNullable<SwitchProps['modelValue']>]
}
