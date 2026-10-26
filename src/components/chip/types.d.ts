import type { ComponentText, ComponentVariant } from '../../types/shared/props'

export interface ChipProps {
  size?: number | string
  inset?: boolean
  label?: ComponentText
  variant?: ComponentVariant | 'secondary'
}
