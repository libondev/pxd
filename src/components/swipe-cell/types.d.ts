import type { Awaitable, ComponentAs, ComponentClass } from '../../types/shared'

export type SwipeCellSide = 'prefix' | 'suffix'
export type SwipeCellDirection = 'left' | 'right'
export type SwipeCellCloseTrigger = SwipeCellSide | 'content' | 'outside'
export type SwipeCellBeforeClose = (trigger: SwipeCellCloseTrigger) => Awaitable<boolean>

export interface SwipeCellOverSwipeState {
  side: SwipeCellSide
  direction: SwipeCellDirection
  distance: number
  width: number
}

export interface SwipeCellSlotState {
  side: SwipeCellSide
  active: boolean
  distance: number
  progress: number
  overSwipe: boolean
}

export interface SwipeCellProps {
  as?: ComponentAs
  disabled?: boolean
  modelValue?: SwipeCellSide | false
  threshold?: number
  /**
   * Ratio of action width for over-swipe. Clamped offset makes values > 1 unreachable.
   * @default 1
   */
  overSwipeThreshold?: number
  closeOnOverSwipe?: boolean
  closeOnClick?: boolean
  /** @default true */
  exclusive?: boolean
  /** @default 'default' */
  group?: string
  /** Return false to prevent close; while open also blocks starting a swipe. */
  beforeClose?: SwipeCellBeforeClose
  contentClass?: ComponentClass
  prefixClass?: ComponentClass
  suffixClass?: ComponentClass
}

export interface SwipeCellEmits {
  open: [side: SwipeCellSide]
  close: []
  'over-swipe': [state: SwipeCellOverSwipeState]
  'update:modelValue': [side: SwipeCellSide | false]
}
