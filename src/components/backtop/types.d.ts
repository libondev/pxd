import type { ComponentSize } from '../../types/shared'

export interface BacktopProps {
  size?: ComponentSize
  appendToBody?: boolean
  visibleThreshold?: number
  scrollTarget?: 'top' | 'bottom'
  scrollBehavior?: ScrollBehavior
}

export interface BacktopEmits {
  click: [PointerEvent]
}
