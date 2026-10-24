import type { ComponentLabel } from '../../types/shared/props'

export interface EllipsisTextProps {
  text: string
  dots?: string
  rows?: number
  action?: boolean
  position?: 'start' | 'middle' | 'end'
  moreText?: ComponentLabel
  lessText?: ComponentLabel
  moreActionClass?: string
  lessActionClass?: string
}

export interface EllipsisTextEmits {
  toggle: [expanded: boolean]
}
