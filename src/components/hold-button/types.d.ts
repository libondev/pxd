import type { ButtonProps } from '../button/types'

export type HoldButtonStatus = 'idle' | 'loading' | 'canceled' | 'confirmed'

export interface HoldButtonProps extends Omit<ButtonProps, 'as'> {
  vibrate?: boolean
  scalable?: boolean
  durations?: number | string
  cancelable?: boolean
  progressColor?: string
}

export interface HoldButtonEmits {
  confirm: []
  canceled: []
  finished: [boolean]
  pointerup: [PointerEvent]
  pointerdown: [PointerEvent]
}
