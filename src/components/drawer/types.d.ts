import type { OverlayCloseReason } from '../../composables/_internal/use-dialog-layer'
import type { ChangeDetails } from '../../types/shared/change'
import type { BasePosition, ComponentClass, ComponentText } from '../../types/shared/props'

export interface DrawerProps {
  heading?: ComponentText
  subtitle?: ComponentText
  dimension?: number | string
  loading?: boolean
  side?: BasePosition
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

export interface DrawerEmits {
  show: []
  hide: []
  close: [reason: OverlayCloseReason]
  change: [boolean, details: ChangeDetails]
  'outside-click': [PointerEvent]
  'visible-change': [visible: boolean]
  'update:model-value': [visible: boolean]
}
