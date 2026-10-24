import type { ComponentClass, ComponentDirection } from '../../types/shared/props'
import type { CSSProperties } from 'vue'

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
