import type { ComponentAs, ComponentLabel } from '../shared'

export interface ListOption extends Record<string, any> {
  as?: ComponentAs
  type?: 'default' | 'error' | 'warning' | 'separator'
  label?: ComponentLabel
  disabled?: boolean
  description?: ComponentLabel
  onClick?: (ev: MouseEvent, item: ListOptionSelected) => void
}

export type ListOptionSelected = Omit<ListOption, 'as' | 'onClick'>
