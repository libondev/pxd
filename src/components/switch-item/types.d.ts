import type { ComponentText } from '../../types/shared/props'

export interface SwitchItemProps {
  label?: ComponentText
  value: string | number
  disabled?: boolean
}

export interface SwitchItemEmits {}
