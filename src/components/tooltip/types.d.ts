import type { CSSProperties } from 'vue'

import type { ComponentClass, ComponentPosition, ComponentVariant } from '../../types/shared'

export interface TooltipProps {
  offset?: number
  content?: string
  variant?: ComponentVariant
  position?: ComponentPosition
  disabled?: boolean
  showArrow?: boolean
  desktopOnly?: boolean
  contentClass?: ComponentClass
  contentStyle?: CSSProperties | string
}
