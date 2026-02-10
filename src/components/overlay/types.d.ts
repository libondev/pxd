export interface OverlayProps {
  blurred?: boolean
  zIndex?: number
  modelValue?: boolean
  transparent?: boolean
  appendToBody?: boolean
  closeOnPressEscape?: boolean
  closeOnClickOverlay?: boolean
  shownElement?: string | HTMLElement
}

export interface OverlayEmits {
  click: [MouseEvent]
  escape: [KeyboardEvent]
  'update:modelValue': [boolean]
}
