export type HoldButtonStatus = 'idle' | 'loading' | 'canceled' | 'confirmed'

export interface HoldButtonProps {
  vibrate?: boolean
  disabled?: boolean
  scalable?: boolean
  duration?: number
  progressColor?: string
}

export interface HoldButtonEmits {
  cancel: [progress: number]
  confirm: []
  pointerup: [PointerEvent]
  pointerdown: [PointerEvent]
}
