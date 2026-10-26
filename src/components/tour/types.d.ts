import type { ComponentPosition, ComponentText } from '../../types/shared/props'

export interface TourStep {
  target?: string | HTMLElement | (() => HTMLElement | null)
  title?: ComponentText
  description?: string
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
  change: [index: number, step: TourStep]
  finish: []
  skip: []
  error: [error: unknown, index: number]
}
