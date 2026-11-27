import type { OverlayCloseReason } from '../../composables/_internal/use-dialog-layer'
import type { ChangeDetails } from '../../types/shared/change'
import type { ComponentClass, ComponentText } from '../../types/shared/props'

export interface ModalProps {
  heading?: ComponentText
  subtitle?: ComponentText
  width?: string | number
  loading?: boolean
  modelValue?: boolean
  loadingText?: ComponentText
  wrapperClass?: ComponentClass
  contentClass?: ComponentClass
  initialFocus?: string | boolean
  defaultHeaderStyle?: boolean
  defaultFooterStyle?: boolean
  closeOnPressEscape?: boolean
  closeOnOutsideClick?: boolean
  closeable?: boolean
  swipeToClose?: boolean
}

export interface ModalEmits {
  show: []
  hide: []
  close: [reason: OverlayCloseReason]
  change: [boolean, details: ChangeDetails]
  'outside-click': [PointerEvent]
  'visible-change': [visible: boolean]
  'update:model-value': [visible: boolean]
}
