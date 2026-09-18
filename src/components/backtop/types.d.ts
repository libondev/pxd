import type { ComponentSize } from '../../types/shared/props'

export interface BacktopProps {
  size?: ComponentSize
  appendToBody?: boolean
  visibleThreshold?: number
  scrollTarget?: 'top' | 'bottom'
  scrollBehavior?: 'smooth' | 'instant'
}

export interface BacktopEmits {
  click: [PointerEvent]
}
