import type { ComponentLabel } from '../../types/shared'

export interface SwitchItemProps {
  label?: ComponentLabel
  value: string | number
  disabled?: boolean
}

export interface SwitchItemEmits {}
