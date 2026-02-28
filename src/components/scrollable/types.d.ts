import type { CSSProperties } from 'vue'

import type { ComponentClass, ComponentDirection, Nullable } from '../../types/shared'

export interface ScrollableProps {
  fader?: boolean
  loading?: boolean
  scrollbar?: boolean
  faderSize?: number
  faderColor?: string
  faderDirection?: ComponentDirection | 'both'
  wrapperClass?: ComponentClass
  contentClass?: ComponentClass
  contentStyle?: CSSProperties | string
  scrollbarSize?: number
  scrollbarColor?: string
  scrollbarHoverColor?: string
  bottomThreshold?: number
}

export interface ScrollableEmits {
  scroll: [Event]
  bottom: [ComponentDirection, Event]
}

export interface ScrollableDragState {
  isDragging: boolean
  direction: Nullable<ComponentDirection>
  startClientPos: number
  startThumbPos: number
}

export interface ScrollableCachedPadding {
  top: number
  bottom: number
  left: number
  right: number
}
