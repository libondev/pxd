import type { ComponentSize, ComponentLabel } from '../../types/shared'

export interface KbdProps {
  alt?: boolean
  ctrl?: boolean
  meta?: boolean
  enter?: boolean
  shift?: boolean
  label?: ComponentLabel
  size?: ComponentSize
}
