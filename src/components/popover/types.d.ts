import type { CSSProperties } from 'vue'

import type { ComponentClass, ComponentPosition } from '../../types/shared'

export type PopoverTrigger = 'click' | 'hover' | 'focus' | 'contextmenu' | 'manual'

export interface PopoverProps {
  zIndex?: number | string
  offset?: number
  visible?: boolean
  trigger?: PopoverTrigger | PopoverTrigger[]
  disabled?: boolean
  maxWidth?: number | string
  position?: ComponentPosition
  showDelay?: number
  hideDelay?: number
  showArrow?: boolean
  arrowColor?: string
  interactive?: boolean
  autoPosition?: boolean
  wrapperClass?: ComponentClass
  contentClass?: ComponentClass
  contentStyle?: CSSProperties | string
  unsetPosition?: boolean
  transitionType?: 'fade' | 'fade-scale' | 'fade-slide'
  toggleOnTrigger?: boolean
  closeOnInvisible?: boolean
  closeOnPressEscape?: boolean
  lockScrollOnVisible?: boolean
}

export interface PopoverEmits {
  show: []
  hide: []
  escape: [KeyboardEvent]
  'outside-click': [MouseEvent]
  'trigger-click': [PointerEvent]
  'visible-change': [visible: boolean]
}
