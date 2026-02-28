import type { ComponentDirection } from '../../types/shared'

export interface FaderProps {
  size?: number
  color?: string
  container?: string | HTMLElement
  direction?: ComponentDirection | 'both'
}
