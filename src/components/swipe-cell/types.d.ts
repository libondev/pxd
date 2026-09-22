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
   * Finger-travel ratio of action width needed to emit `over-swipe`.
   * Visual offset stays clamped to the action width.
   * @default 1.68
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
