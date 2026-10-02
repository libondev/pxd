import type {
  BasePosition,
  ComponentDirection,
  ComponentLabel,
  ComponentValue,
} from '../../types/shared'

export interface CarouselOption {
  /** Rendered as the slide content when no `item` slot is provided. */
  label?: ComponentLabel
  /** Used as the vnode key; falls back to the slide index. */
  value?: ComponentValue
  [key: string]: any
}

export interface CarouselProps {
  index?: number
  loop?: boolean
  arrow?: boolean
  height?: number | string
  autoplay?: boolean
  interval?: number
  indicator?: boolean
  direction?: ComponentDirection
  indicatorType?: 'dot' | 'line'
  indicatorPosition?: BasePosition | 'center'
  pauseOnHover?: boolean
  toggleOnWheel?: boolean
  options?: CarouselOption[]
}

export interface CarouselEmits {
  change: [index: number]
}
