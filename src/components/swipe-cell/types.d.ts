import type { ComponentAs, ComponentClass } from '../../types/shared/props'
import type { Awaitable } from '../../types/shared/utils'

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
  thresholdRate?: number
  overSwipeRate?: number
  closeOnOverSwipe?: boolean
  closeOnClick?: boolean
  exclusive?: boolean
  group?: string
  beforeClose?: SwipeCellBeforeClose
  contentClass?: ComponentClass
  prefixClass?: ComponentClass
  suffixClass?: ComponentClass
}

export interface SwipeCellEmits {
  open: [side: SwipeCellSide]
  close: []
  'over-swipe': [state: SwipeCellOverSwipeState]
  'update:model-value': [side: SwipeCellSide | false]
}
