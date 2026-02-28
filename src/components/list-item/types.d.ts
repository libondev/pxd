import type { ListOption, ListOptionSelected } from '../list/types'

export interface ListItemProps {
  as?: ListOption['as']
  type?: ListOption['type']
  label?: ListOption['label']
  value?: ListOption['value']
  disabled?: ListOption['disabled']
  description?: ListOption['description']
}

export interface ListItemEmits {
  click: [ListOptionSelected, MouseEvent]
}
