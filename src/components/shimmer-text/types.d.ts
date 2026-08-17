export type ShimmerTextVariant = 'sunrise' | 'bubble' | 'tonic' | 'spring' | 'twilight'

export interface ShimmerGradientStop {
  color: string
  position: number
}

export interface ShimmerTextProps {
  text?: string
  color?: string | ShimmerGradientStop[]
  variant?: ShimmerTextVariant
  interval?: number
  durations?: number
}
