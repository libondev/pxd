import type { CSSProperties } from 'vue'

import type { ComponentClass, ComponentDirection } from '../../types/shared'

export interface ScrollableProps {
  fader?: boolean
  faderSize?: number
  faderColor?: string
  faderDirection?: ComponentDirection | 'both'
  scrollbar?: boolean
  wrapperClass?: ComponentClass
  contentClass?: ComponentClass
  contentStyle?: CSSProperties | string
  scrollbarSize?: number
  scrollbarColor?: string
  scrollbarHoverColor?: string
  loading?: boolean
  endThreshold?: number
}

export interface ScrollableEmits {
  scroll: [Event]
  end: [Event, ComponentDirection]
}
