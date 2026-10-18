import type { ComponentLabel } from '../../types/shared/props'

export interface SwitchItemProps {
  label?: ComponentLabel
  value: string | number
  disabled?: boolean
}

export interface SwitchItemEmits {}
