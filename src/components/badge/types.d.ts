import type { ComponentAs, ComponentSize } from '../../types/shared'
import type { BadgeVariant } from './cn'

export interface BadgeProps {
  as?: ComponentAs
  href?: string
  size?: ComponentSize
  variant?: BadgeVariant
}
