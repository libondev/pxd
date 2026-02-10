import type { ComponentLabel, ComponentSize } from '../../types/shared'
import type { noteVariant } from './cn'

export interface NoteProps {
  variant?: keyof typeof noteVariant.variants.variant
  size?: ComponentSize
  fill?: boolean
  label?: boolean | ComponentLabel
}
