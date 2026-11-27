import type { ComponentText } from '../../types/shared/props'

export type ShimmerTextVariant = 'sunrise' | 'bubble' | 'tonic' | 'spring' | 'twilight'

export interface ShimmerGradientStop {
  color: string
  position: number
}

export interface ShimmerTextProps {
  text?: ComponentText
  color?: string | ShimmerGradientStop[]
  variant?: ShimmerTextVariant
  animated?: boolean
  duration?: number
}
