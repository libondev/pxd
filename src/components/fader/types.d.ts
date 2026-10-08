import type { ComponentDirection } from '../../types/shared'
import type { ComponentPublicInstance } from 'vue'

export interface FaderProps {
  size?: number
  color?: string
  scrollTarget?: string | HTMLElement | ComponentPublicInstance | null
  direction?: ComponentDirection | 'both'
}
