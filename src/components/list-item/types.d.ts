import type { ListOption } from '../list/types'

export interface ListItemProps {
  as?: ListOption['as']
  label?: ListOption['label']
  value?: ListOption['value']
  variant?: ListOption['variant']
  disabled?: ListOption['disabled']
  description?: ListOption['description']
  /** Navigable index within the list (for keyboard / pointer). */
  index?: number
  /** Whether this item is the keyboard/pointer active item. */
  active?: boolean
}

export interface ListItemEmits {
  click: [ListOption['value'], MouseEvent]
}
