import type { ComponentOption, ComponentSize } from '../shared'

export interface SwitchGroupProps {
  disabled?: boolean
  required?: boolean
  fullWidth?: boolean
  size?: ComponentSize
  options?: ComponentOption[]
  modelValue?: string | number
}
