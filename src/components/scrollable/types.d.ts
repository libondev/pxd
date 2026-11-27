import type { ComponentClass, ComponentDirection } from '../../types/shared/props'

export interface ScrollableProps {
  fader?: boolean
  loading?: boolean
  scrollbar?: boolean
  faderColor?: string
  faderDimension?: number
  faderDirection?: ComponentDirection | 'both'
  wrapperClass?: ComponentClass
  contentClass?: ComponentClass
  scrollbarDimension?: number
  scrollbarColor?: string
  scrollbarHoverColor?: string
  bottomThreshold?: number
}

export interface ScrollableEmits {
  scroll: [Event]
  bottom: [ComponentDirection, Event]
}
