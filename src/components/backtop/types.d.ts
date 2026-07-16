export interface BacktopProps {
  appendToBody?: boolean
  visibleThreshold?: number
  scrollTarget?: 'top' | 'bottom'
  scrollBehavior?: 'smooth' | 'instant'
}

export interface BacktopEmits {
  click: [PointerEvent]
}
