import type { BasePosition, ComponentClass, ComponentLabel } from '../../types/shared'

export interface DrawerProps {
  zIndex?: number
  title?: ComponentLabel
  subtitle?: ComponentLabel
  size?: number | string
  loading?: boolean
  position?: BasePosition
  modelValue?: boolean
  appendToBody?: boolean
  wrapperClass?: ComponentClass
  contentClass?: ComponentClass
  autoFocusElement?: string | boolean
  defaultHeaderStyle?: boolean
  defaultFooterStyle?: boolean
  closeOnPressEscape?: boolean
  closeOnClickOverlay?: boolean
}

export interface DrawerEmits {
  show: []
  hide: []
  change: [boolean]
  'outside-click': [PointerEvent]
  'visible-change': [visible: boolean]
  'update:modelValue': [visible: boolean]
}
