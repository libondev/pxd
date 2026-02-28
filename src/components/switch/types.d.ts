import type { ComponentLabel } from '../../types/shared'

export interface SwitchProps {
  label?: ComponentLabel
  value: string | number
  disabled?: boolean
}

export interface SwitchEmits {}
