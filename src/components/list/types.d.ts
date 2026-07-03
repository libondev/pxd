import type { ComponentAs, ComponentLabel, ComponentValue } from '../../types/shared'

export interface ListOption {
  as?: ComponentAs
  label?: ComponentLabel
  value: ComponentValue
  disabled?: boolean
  variant?: 'default' | 'error' | 'warning'
  description?: ComponentLabel
  keywords?: string[]
  onClick?: (item: ListOptionSelected, ev: MouseEvent) => void
  [key: string]: any
}

export interface ListOptionGroup {
  type: 'group'
  label?: ComponentLabel
  options: ListOption[]
}

export type ListOptionEntry = ListOption | ListOptionGroup

export type ListOptionSelected = Omit<ListOption, 'as' | 'keywords' | 'onClick'>
export type ListOptions = ListOptionEntry[]

export interface ListProps {
  loop?: boolean
  empty?: boolean
  value?: ComponentValue
  visible?: boolean
  options?: ListOptionEntry[]
  toggleOnKeyPress?: boolean
  defaultActiveIndex?: number
}

export interface ListEmits {
  toggle: []
  select: [ListOptionSelected, MouseEvent]
}
