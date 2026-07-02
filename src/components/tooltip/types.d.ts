import type { ComponentClass, ComponentPosition } from '../../types/shared'
import type { CSSProperties } from 'vue'

export interface TooltipProps {
  offset?: number
  content?: string
  variant?: 'default' | 'error' | 'warning' | 'success' | 'invert' | 'violet'
  position?: ComponentPosition
  disabled?: boolean
  showDelay?: number
  hideDelay?: number
  triggerSelector?: string
  showArrow?: boolean
  desktopOnly?: boolean
  contentClass?: ComponentClass
  contentStyle?: CSSProperties | string
}
