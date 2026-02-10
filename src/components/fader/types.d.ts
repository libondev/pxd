import type { ComponentDirection } from '../../types/shared/props'

export interface FaderProps {
  size?: number
  color?: string
  container?: string | HTMLElement
  direction?: ComponentDirection | 'both'
}
