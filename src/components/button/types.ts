import type { VNode } from 'vue'

export interface ButtonProps {
  as?: keyof HTMLElementTagNameMap | 'router-link' | VNode
  variant?: 'outline' | 'ghost' | 'primary' | 'error' | 'warning' | 'success'
  size?: 'sm' | 'md' | 'lg'
  shape?: 'square' | 'rounded'
  block?: boolean
  loading?: boolean
  disabled?: boolean
}
