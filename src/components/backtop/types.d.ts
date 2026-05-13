export interface BacktopProps {
  appendToBody?: boolean
  visibleThreshold?: number
  scrollTarget?: 'top' | 'bottom'
}

export interface BacktopEmits {
  click: [PointerEvent]
}
