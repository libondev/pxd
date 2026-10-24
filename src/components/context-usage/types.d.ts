import type { ComponentSize } from '../../types/shared/props'

export interface ContextUsageSegment {
  name: string
  tokens: number
}

export interface ContextUsageProps {
  total: number
  data: readonly ContextUsageSegment[]
  size?: ComponentSize
  legend?: boolean
}
