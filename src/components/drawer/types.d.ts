import type { BasePosition, ComponentClass, ComponentLabel } from '../../types/shared'

export interface DrawerProps {
  title?: ComponentLabel
  subtitle?: ComponentLabel
  size?: number | string
  loading?: boolean
  position?: BasePosition
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

export interface DrawerEmits {
  show: []
  hide: []
  change: [boolean]
  'outside-click': [MouseEvent]
  'visible-change': [boolean]
  'update:modelValue': [boolean]
}
