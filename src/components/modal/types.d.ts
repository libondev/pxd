import type { ComponentClass, ComponentLabel } from '../../types/shared'

export interface ModalProps {
  zIndex?: number
  title?: ComponentLabel
  subtitle?: ComponentLabel
  width?: string | number
  loading?: boolean
  modelValue?: boolean
  appendToBody?: boolean
  wrapperClass?: ComponentClass
  contentClass?: ComponentClass
  /**
   * Whether to automatically focus on the first or specified element.
   */
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
  'visible-change': [boolean]
  'outside-click': [MouseEvent]
  'update:modelValue': [boolean]
}
