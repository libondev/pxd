import type { ComponentOption, ComponentSize } from '../../types/components/shared'

export interface SwitchGroupProps {
  block?: boolean
  disabled?: boolean
  required?: boolean
  size?: ComponentSize
  modelValue?: string | number
  options?: ComponentOption[]
}
