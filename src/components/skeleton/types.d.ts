import type { ComponentShape } from '../../types/shared/props'

export interface SkeletonProps {
  loading?: boolean
  animated?: boolean
  width?: string | number
  height?: string | number
  boxHeight?: string | number
  shape?: ComponentShape
}
