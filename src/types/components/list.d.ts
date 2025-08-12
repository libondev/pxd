import type { ComponentAs, ComponentLabel } from '../shared'

export interface ListOption extends Record<string, any> {
  as?: ComponentAs
  type?: 'error'
  label?: ComponentLabel
  value?: string | number
  disabled?: boolean
  description?: ComponentLabel
  onClick?: (ev: MouseEvent, index: number) => void
}
