import type { ComponentClass, ComponentPosition } from '../../types/shared'
import type { CSSProperties } from 'vue'

export type PopoverTrigger = 'click' | 'hover' | 'contextmenu' | 'manual'

export interface PopoverProps {
  zIndex?: number | string
  offset?: number
  trigger?: PopoverTrigger | PopoverTrigger[]
  triggerSelector?: string
  alignPoint?: boolean
  disabled?: boolean
  adaptive?: boolean
  maxWidth?: number | string
  position?: ComponentPosition
  showDelay?: number
  hideDelay?: number
  showArrow?: boolean
  arrowColor?: string
  modelValue?: boolean
  interactive?: boolean
  autoPosition?: boolean
  wrapperClass?: ComponentClass
  contentClass?: ComponentClass
  contentStyle?: CSSProperties | string
  toggleOnTrigger?: boolean
  fillTriggerWidth?: boolean
  closeOnInvisible?: boolean
  closeOnPressEscape?: boolean
  lockScrollOnVisible?: boolean
}

export interface PopoverEmits {
  show: []
  hide: []
  escape: [KeyboardEvent]
  'outside-click': [PointerEvent]
  'trigger-click': [PointerEvent]
  'visible-change': [visible: boolean]
  'wrapper-keydown': [KeyboardEvent]
  'update:modelValue': [visible: boolean]
}
