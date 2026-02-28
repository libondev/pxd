import type { ComponentDirection } from '../../types/shared'

export interface FaderProps {
  size?: number
  color?: string
  container?: string | object
  direction?: ComponentDirection | 'both'
}
