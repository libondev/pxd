import type { ComponentClass, ComponentPosition, ComponentVariant } from '../../types/shared'
import type { CSSProperties } from 'vue'

export interface TooltipProps {
  offset?: number
  content?: string
  variant?: ComponentVariant
  position?: ComponentPosition
  disabled?: boolean
  showDelay?: number
  hideDelay?: number
  showArrow?: boolean
  desktopOnly?: boolean
  contentClass?: ComponentClass
  contentStyle?: CSSProperties | string
}
