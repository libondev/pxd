import type { BasePosition, ComponentClass, ComponentLabel } from '../../types/shared/props'

export interface DrawerProps {
  zIndex?: number
  title?: ComponentLabel
  subtitle?: ComponentLabel
  size?: number | string
  loading?: boolean
  position?: BasePosition
  modelValue?: boolean
  loadingText?: ComponentLabel
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
  change: [boolean]
  'outside-click': [PointerEvent]
  'visible-change': [visible: boolean]
  'update:model-value': [visible: boolean]
}
