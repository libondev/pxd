import type { ChangeDetails, ChangeReason } from '../../types/shared/change'
import type {
  BasePosition,
  ComponentDirection,
  ComponentText,
  ComponentValue,
} from '../../types/shared/props'

export type CarouselChangeReason = Extract<ChangeReason, 'item-press' | 'api' | 'sync'>

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
  showArrow?: boolean
  height?: number | string
  autoplay?: boolean
  interval?: number
  showIndicator?: boolean
  direction?: ComponentDirection
  indicatorPosition?: BasePosition | 'center'
  pauseOnHover?: boolean
  toggleOnWheel?: boolean
  options?: CarouselOption[]
}

export interface CarouselMove {
  from: number
  to: number
  direction: 1 | -1
  /** Whether the move crossed the boundary of a looping carousel. */
  wrapped: boolean
}

export interface CarouselEmits {
  change: [index: number, details: ChangeDetails<CarouselChangeReason>]
}
