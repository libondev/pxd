import type { ListOption } from '../list/types'

export interface ListItemProps {
  as?: ListOption['as']
  label?: ListOption['label']
  value?: ListOption['value']
  variant?: ListOption['variant']
  disabled?: ListOption['disabled']
  keywords?: string[]
  description?: ListOption['description']
  onClick?: never
}

export interface ListItemEmits {
  click: [ListOption['value'], MouseEvent]
}
