import type { ComponentLabel, ComponentVariant } from '../../types/shared/props'

export interface ChipProps {
  size?: number | string
  inset?: boolean
  label?: ComponentLabel
  variant?: ComponentVariant | 'secondary'
}
