import type { TooltipVariant } from '../../constants/tooltip-variants'
import type { ComponentClass, ComponentPosition } from '../../types/shared'

export interface TooltipProps {
  content?: string
  variant?: TooltipVariant
  position?: ComponentPosition
  disabled?: boolean
  showDelay?: number
  hideDelay?: number
  desktopOnly?: boolean
  contentClass?: ComponentClass
}
