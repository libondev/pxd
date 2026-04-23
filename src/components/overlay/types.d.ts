export interface OverlayProps {
  zIndex?: number
  variant?: 'default' | 'blurred' | 'transparent'
  modelValue?: boolean
  showOverlay?: boolean
  appendToBody?: boolean
  shownElement?: string | object
  closeOnPressEscape?: boolean
  closeOnClickOverlay?: boolean
  lockScrollOnVisible?: boolean
  preventDefaultOnTab?: boolean
}

export interface OverlayEmits {
  click: [MouseEvent]
  escape: [KeyboardEvent]
  'update:modelValue': [boolean]
}
