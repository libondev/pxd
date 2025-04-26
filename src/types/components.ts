import type { VNode } from 'vue'

export type ComponentSize = 'sm' | 'md' | 'lg'
export type ComponentAs = keyof HTMLElementTagNameMap | 'router-link' | 'RouterLink' | VNode

export interface ButtonProps {
  as?: ComponentAs
  variant?: 'outline' | 'ghost' | 'primary' | 'error' | 'warning' | 'success'
  size?: ComponentSize
  shape?: 'square' | 'rounded'
  block?: boolean
  loading?: boolean
  disabled?: boolean
}
