export interface EllipsisTextProps {
  text: string
  dots?: string
  rows?: number
  action?: boolean
  position?: 'start' | 'middle' | 'end'
  moreText?: string
  lessText?: string
  actionClass?: string
}

export interface EllipsisTextEmits {
  toggle: [expanded: boolean]
}
