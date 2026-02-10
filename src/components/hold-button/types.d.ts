import type { ButtonProps } from '../button/types'

export type HoldButtonStatus = 'idle' | 'loading' | 'canceled' | 'confirmed'

export interface HoldButtonProps extends Omit<ButtonProps, 'as'> {
  vibrate?: boolean
  scalable?: boolean
  durations?: number | string
  maskColor?: string
  cancelable?: boolean
}

export interface HoldButtonEmits {
  confirm: []
  canceled: []
  finished: [boolean]
  pointerup: [PointerEvent]
  pointerdown: [PointerEvent]
}
