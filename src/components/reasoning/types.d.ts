import type { ComponentText } from '../../types/shared/props'
import { ShimmerTextVariant } from '../shimmer-text/types'

export interface ReasoningProps {
  heading?: ComponentText
  expand?: boolean
  variant?: 'default' | 'simple'
  streaming?: boolean
  shimmerVariant?: ShimmerTextVariant
}
