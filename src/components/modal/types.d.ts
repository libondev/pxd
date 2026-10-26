import type { ComponentClass, ComponentText } from '../../types/shared/props'

export interface ModalProps {
  zIndex?: number
  title?: ComponentText
  subtitle?: ComponentText
  width?: string | number
  loading?: boolean
  modelValue?: boolean
  loadingText?: ComponentText
  wrapperClass?: ComponentClass
  contentClass?: ComponentClass
  autoFocusElement?: string | boolean
  defaultHeaderStyle?: boolean
  defaultFooterStyle?: boolean
  closeOnPressEscape?: boolean
  closeOnClickOverlay?: boolean
  closeable?: boolean
}

export interface ModalEmits {
  show: []
  hide: []
  change: [boolean]
  'outside-click': [PointerEvent]
  'visible-change': [visible: boolean]
  'update:model-value': [visible: boolean]
}
