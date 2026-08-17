import type { Awaitable, ComponentAs, ComponentClass } from '../../types/shared'

export type SwipeCellSide = 'prefix' | 'suffix'
export type SwipeCellDirection = 'left' | 'right'
export type SwipeCellCloseTrigger = 'left' | 'right' | 'content' | 'outside'
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
  overSwipeThreshold?: number
  closeOnOverSwipe?: boolean
  closeOnClick?: boolean
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
