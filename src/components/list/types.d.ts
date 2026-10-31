import type {
  ComponentAs,
  ComponentClass,
  ComponentText,
  ComponentValue,
} from '../../types/shared/props'
import type { Component } from 'vue'

export interface ListOption {
  as?: ComponentAs
  label?: ComponentText
  value: ComponentValue
  disabled?: boolean
  variant?: 'default' | 'error' | 'warning'
  description?: string
  icon?: string | Component
  [key: string]: any
}

export interface ListOptionGroup {
  type: 'group'
  label?: string
  options: ListOption[]
}

export type ListOptionEntry = ListOption | ListOptionGroup

/** The option an event carries: the data fields, without the render-only `as` and `icon`. */
export interface ListOptionSelected {
  label?: ComponentText
  value: ComponentValue
  disabled?: boolean
  variant?: 'default' | 'error' | 'warning'
  description?: string
}

export type ListOptions = ListOptionEntry[]
export type ListModelValue = ComponentValue | ComponentValue[] | null

export type ListFilterMethodFn = (option: ListOption, query: string) => boolean
export type ListRemoteFilterFn = (query: string) => ListOptions | Promise<ListOptions>

export interface ListProps {
  loop?: boolean
  multiple?: boolean
  modelValue?: ListModelValue
  options?: ListOptionEntry[]
  itemClass?: ComponentClass
  defaultActiveIndex?: number
  loading?: boolean
  virtual?: boolean
  itemSize?: number
  overScan?: number
}

export interface ListEmits {
  change: [ListOptionSelected]
  'update:model-value': [ListModelValue]
}
