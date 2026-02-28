import type { ComponentAs, ComponentLabel, ComponentOption } from '../../types/shared'

export interface ListOption extends Partial<ComponentOption> {
  as?: ComponentAs
  type?: 'default' | 'error' | 'warning' | 'separator'
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
