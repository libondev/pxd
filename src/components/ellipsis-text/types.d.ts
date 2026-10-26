import type { ComponentText } from '../../types/shared/props'

export interface EllipsisTextProps {
  text: string
  dots?: string
  rows?: number
  action?: boolean
  position?: 'start' | 'middle' | 'end'
  moreText?: ComponentText
  lessText?: ComponentText
  moreActionClass?: string
  lessActionClass?: string
}

export interface EllipsisTextEmits {
  toggle: [expanded: boolean]
}
