import type { ComponentClass, ComponentPosition, PopoverTrigger } from '../../types/shared/props'

export type PopoverLayout = 'auto' | 'anchored' | 'sheet'

export interface PopoverProps {
  zIndex?: number | string
  offset?: number
  trigger?: PopoverTrigger | PopoverTrigger[]
  triggerSelector?: string
  asChild?: boolean
  alignPoint?: boolean
  disabled?: boolean
  layout?: PopoverLayout
  matchWidth?: boolean
  keepHeight?: boolean
  maxWidth?: number | string
  maxHeight?: number | string
  position?: ComponentPosition
  showDelay?: number
  hideDelay?: number
  showArrow?: boolean
  arrowColor?: string
  modelValue?: boolean
  interactive?: boolean
  autoPosition?: boolean
  destroyDelay?: number
  wrapperClass?: ComponentClass
  contentClass?: ComponentClass
  contentRole?: string
  ariaLabelledby?: string
  ariaTarget?: HTMLElement
  toggleOnTrigger?: boolean
  initialFocus?: string | boolean
  closeOnInvisible?: boolean
  closeOnPressEscape?: boolean
  closeOnOutsideClick?: boolean
  returnFocusOnDeactivate?: boolean
  agent?: boolean
}

export interface PopoverEmits {
  show: []
  hide: []
  escape: [KeyboardEvent]
  'outside-click': [PointerEvent]
  'trigger-click': [PointerEvent]
  'visible-change': [visible: boolean]
  'wrapper-keydown': [KeyboardEvent]
  'update:model-value': [visible: boolean]
}
