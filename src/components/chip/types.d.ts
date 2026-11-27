import type { ComponentText, ComponentVariant } from '../../types/shared/props'

export interface ChipProps {
  dimension?: number | string
  inset?: boolean
  label?: ComponentText
  variant?: ComponentVariant | 'secondary'
}
