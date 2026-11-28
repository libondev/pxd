import type { ChangeDetails, ChangeReason } from '../../types/shared/change'
import type { ComponentPosition, ComponentText } from '../../types/shared/props'

export type TourChangeReason = Extract<ChangeReason, 'item-press'>

export interface TourStep {
  target?: string | HTMLElement | (() => HTMLElement | null)
  heading?: ComponentText
  description?: ComponentText
  position?: ComponentPosition
  nextText?: ComponentText
  prevText?: ComponentText
  beforeEnter?: (ctx: { index: number; step: TourStep }) => void | Promise<void>
}

export interface TourProps {
  modelValue?: boolean
  current?: number
  steps: TourStep[]
  zIndex?: number
  showSkip?: boolean
  showProgress?: boolean
}

export interface TourEmits {
  'update:model-value': [boolean]
  'update:current': [number]
  change: [index: number, details: ChangeDetails<TourChangeReason>]
  finish: []
  skip: []
  error: [error: unknown, index: number]
}
