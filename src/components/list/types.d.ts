import type { ComponentAs, ComponentLabel, ComponentOption } from '../../types/shared'

export interface ListOption extends Partial<ComponentOption> {
  as?: ComponentAs
  variant?: 'default' | 'error' | 'warning'
  description?: ComponentLabel
  onClick?: (item: ListOptionSelected, ev: MouseEvent) => void
}

export type ListOptionSelected = Omit<ListOption, 'as' | 'onClick'>

export interface ListProps {
  loop?: boolean
  value?: ComponentOption['value']
  visible?: boolean
  options?: ListOption[]
  toggleOnKeyPress?: boolean
  defaultActiveIndex?: number
}

export interface ListEmits {
  toggle: []
  select: [ListOptionSelected, MouseEvent]
}
