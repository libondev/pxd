import type { ComponentClass, ComponentLabel } from '../../types/shared'

export interface ModalProps {
  title?: ComponentLabel
  subtitle?: ComponentLabel
  width?: string | number
  loading?: boolean
  modelValue?: boolean
  appendToBody?: boolean
  headerStylize?: boolean
  footerStylize?: boolean
  wrapperClass?: ComponentClass
  contentClass?: ComponentClass
  autoFocusElement?: string | boolean
  closeOnPressEscape?: boolean
  closeOnClickOverlay?: boolean
}

export interface ModalEmits {
  show: []
  hide: []
  change: [boolean]
  'visible-change': [boolean]
  'outside-click': [MouseEvent]
  'update:modelValue': [boolean]
}
