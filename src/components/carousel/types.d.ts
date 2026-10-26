import type {
  BasePosition,
  ComponentDirection,
  ComponentText,
  ComponentValue,
} from '../../types/shared/props'

export interface CarouselOption {
  /** Rendered as the slide content when no `item` slot is provided. */
  label?: ComponentText
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
  indicatorPosition?: BasePosition | 'center'
  pauseOnHover?: boolean
  toggleOnWheel?: boolean
  options?: CarouselOption[]
}

export interface CarouselEmits {
  change: [index: number]
}
