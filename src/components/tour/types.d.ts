import type { ComponentPosition } from '../../types/shared/props'

export interface TourStep {
  target?: string | HTMLElement | (() => HTMLElement | null)
  title?: string
  description?: string
  position?: ComponentPosition
  nextText?: string
  prevText?: string
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
  change: [index: number, step: TourStep]
  finish: []
  skip: []
  error: [error: unknown, index: number]
}
