export type HoldButtonStatus = 'idle' | 'loading' | 'canceled' | 'confirmed'

export interface HoldButtonProps {
  vibrate?: boolean
  disabled?: boolean
  scalable?: boolean
  durations?: number | string
  cancelable?: boolean
  progressColor?: string
}

export interface HoldButtonEmits {
  cancel: []
  confirm: []
  release: [confirmed: boolean]
  pointerup: [PointerEvent]
  pointerdown: [PointerEvent]
}
