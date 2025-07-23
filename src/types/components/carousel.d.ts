import type { BasePosition } from '../shared'

export interface CarouselGroupProps {
  index?: number
  loop?: boolean
  arrow?: boolean
  height?: number | string
  autoplay?: boolean
  interval?: number
  indicator?: boolean
  direction?: 'horizontal' | 'vertical'
  indicatorType?: 'dot' | 'line'
  indicatorPosition?: BasePosition
  pauseOnHover?: boolean
  toggleOnWheel?: boolean
}
