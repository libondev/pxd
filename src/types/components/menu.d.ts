import type { ComponentAs, ComponentLabel } from './shared'

export interface MenuListOption extends Record<string, any> {
  as?: ComponentAs
  type?: 'error'
  label?: ComponentLabel
  value?: string | number
  disabled?: boolean
  onClick?: (option: MenuListOption) => void
}
