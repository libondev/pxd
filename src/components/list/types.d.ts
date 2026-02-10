import type { ComponentAs, ComponentLabel } from '../shared'

export interface ListOption extends Record<string, any> {
  as?: ComponentAs
  type?: 'default' | 'error' | 'warning' | 'separator'
  label?: ComponentLabel
  value?: any
  disabled?: boolean
  description?: ComponentLabel
  onClick?: (item: ListOptionSelected, ev: MouseEvent) => void
}

export type ListOptionSelected = Omit<ListOption, 'as' | 'onClick'>

export interface ListProps {
  loop?: boolean
  options?: ListOption[]
  keyListener?: boolean
  itemTransition?: boolean
  closeOnPressEscape?: boolean
}

export interface ListEmits {
  toggle: []
  escape: [KeyboardEvent]
  select: [MouseEvent, ListOptionSelected]
}

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
