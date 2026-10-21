export interface OverlayProps {
  zIndex?: number
  variant?: 'default' | 'blurred' | 'none'
  modelValue?: boolean
  closeOnPressEscape?: boolean
  closeOnClickOverlay?: boolean
  lockScrollOnVisible?: boolean
}

export interface OverlayEmits {
  click: [PointerEvent]
  escape: [KeyboardEvent]
  'update:modelValue': [boolean]
}
