import type { ComponentAs, ComponentLabel, ComponentValue } from '../../types/shared'

export interface ListOption {
  as?: ComponentAs
  label?: ComponentLabel
  value: ComponentValue
  disabled?: boolean
  variant?: 'default' | 'error' | 'warning'
  description?: string
  keywords?: string[]
  [key: string]: any
}

export interface ListOptionGroup {
  type: 'group'
  label?: ComponentLabel
  options: ListOption[]
}

export type ListOptionEntry = ListOption | ListOptionGroup

export type ListOptionSelected = Omit<ListOption, 'as' | 'keywords'>
export type ListOptions = ListOptionEntry[]
export type ListModelValue = ComponentValue | ComponentValue[] | null

export interface ListProps {
  loop?: boolean
  empty?: boolean
  multiple?: boolean
  value?: any
  options?: ListOptionEntry[]
  defaultActiveIndex?: number
}

export interface ListEmits {
  toggle: [number]
  change: [ListOptionSelected, MouseEvent]
}
