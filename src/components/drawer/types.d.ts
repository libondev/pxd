import type { OverlayCloseReason } from '../../composables/_internal/use-overlay-dialog'
import type { ChangeDetails } from '../../types/shared/change'
import type { BasePosition, ComponentClass, ComponentText } from '../../types/shared/props'

export interface DrawerProps {
  zIndex?: number
  title?: ComponentText
  subtitle?: ComponentText
  size?: number | string
  loading?: boolean
  position?: BasePosition
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

export interface DrawerEmits {
  show: []
  hide: []
  close: [reason: OverlayCloseReason]
  change: [boolean, details: ChangeDetails]
  'outside-click': [PointerEvent]
  'visible-change': [visible: boolean]
  'update:model-value': [visible: boolean]
}
