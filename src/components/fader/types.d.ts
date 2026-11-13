import type { ComponentDirection } from '../../types/shared/props'
import type { ComponentPublicInstance } from 'vue'

export interface FaderProps {
  size?: number
  color?: string
  threshold?: number
  direction?: ComponentDirection | 'both'
  scrollTarget?: string | HTMLElement | ComponentPublicInstance | null
}
