import type { BasePosition, ComponentDirection } from '../../types/shared'

export interface CarouselGroupProps {
  index?: number
  loop?: boolean
  arrow?: boolean
  height?: number | string
  autoplay?: boolean
  interval?: number
  indicator?: boolean
  direction?: ComponentDirection
  indicatorType?: 'dot' | 'line'
  indicatorPosition?: BasePosition
  pauseOnHover?: boolean
  toggleOnWheel?: boolean
}

export interface CarouselGroupEmits {
  change: [index: number]
}
