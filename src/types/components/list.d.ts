import type { ComponentAs, ComponentLabel } from '../shared'

export interface ListOption extends Record<string, any> {
  as?: ComponentAs
  type?: 'default' | 'error' | 'warning' | 'separator'
  label?: ComponentLabel
  value?: string | number
  disabled?: boolean
  description?: ComponentLabel
  onClick?: (ev: MouseEvent, item: SelectedListOption, index: number) => void
}

export type SelectedListOption = Omit<ListOption, 'as' | 'onClick'>
export type ListOptionCallbackParams = Parameters<ListOption['onClick']>
