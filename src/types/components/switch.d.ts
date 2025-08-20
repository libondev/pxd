import type { ComponentOption, ComponentSize } from '../shared'

export interface SwitchGroupProps {
  block?: boolean
  disabled?: boolean
  required?: boolean
  size?: ComponentSize
  options?: ComponentOption[]
  modelValue?: string | number
}
