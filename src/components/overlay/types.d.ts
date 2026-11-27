export interface OverlayProps {
  zIndex?: number
  variant?: 'default' | 'blurred' | 'none'
  modelValue?: boolean
  closeOnPressEscape?: boolean
  closeOnOutsideClick?: boolean
  lockScrollOnVisible?: boolean
  to?: string | HTMLElement
}

export interface OverlayEmits {
  click: [PointerEvent]
  escape: [KeyboardEvent]
  'update:model-value': [boolean]
}
