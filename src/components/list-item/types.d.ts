import type { ListOption, ListOptionSelected } from '../list/types'

export interface ListItemProps {
  as?: ListOption['as']
  label?: ListOption['label']
  value?: ListOption['value']
  variant?: ListOption['variant']
  disabled?: ListOption['disabled']
  keywords?: string[]
  description?: ListOption['description']
}

export interface ListItemEmits {
  click: [ListOptionSelected, MouseEvent]
}
