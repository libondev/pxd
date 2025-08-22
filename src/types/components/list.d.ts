import type { ComponentAs, ComponentLabel } from '../shared'

export interface ListOption extends Record<string, any> {
  as?: ComponentAs
  type?: 'default' | 'error' | 'warning' | 'separator'
  label?: ComponentLabel
  value?: string | number
  disabled?: boolean
  description?: ComponentLabel
  onClick?: (ev: MouseEvent, item: ListOptionSelected, index: number) => void
}

export type ListOptionSelected = Omit<ListOption, 'as' | 'onClick'>
export type ListOptionCallbackParams = Parameters<ListOption['onClick']>
