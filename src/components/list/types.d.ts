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
  label?: string
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
  modelValue?: ListModelValue
  options?: ListOptionEntry[]
  defaultActiveIndex?: number
  /** Enable virtualized rendering for large option sets. */
  virtual?: boolean
  /** Estimated row height in px when `virtual` is enabled. */
  itemSize?: number
  /** Extra rows rendered outside the viewport when `virtual` is enabled. */
  overScan?: number
}

export interface ListEmits {
  change: [ListOptionSelected]
  'update:modelValue': [ListModelValue]
}
