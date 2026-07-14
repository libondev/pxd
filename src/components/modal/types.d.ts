import type { ComponentClass, ComponentLabel } from '../../types/shared'

export interface ModalProps {
  zIndex?: number
  title?: ComponentLabel
  subtitle?: ComponentLabel
  width?: string | number
  loading?: boolean
  modelValue?: boolean
  loadingText?: string
  appendToBody?: boolean
  wrapperClass?: ComponentClass
  contentClass?: ComponentClass
  autoFocusElement?: string | boolean
  defaultHeaderStyle?: boolean
  defaultFooterStyle?: boolean
  closeOnPressEscape?: boolean
  closeOnClickOverlay?: boolean
}

export interface ModalEmits {
  show: []
  hide: []
  change: [boolean]
  'outside-click': [PointerEvent]
  'visible-change': [visible: boolean]
  'update:modelValue': [visible: boolean]
}
