import type { VNode } from 'vue'

export type ComponentVariant = 'primary' | 'error' | 'warning' | 'success'
export type ComponentVariantWithDefault = ComponentVariant | 'default'

export type ComponentSize = 'sm' | 'md' | 'lg'
export type ComponentSizeWithXs = ComponentSize | 'xs'

export type ComponentBreakpointKeys = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type ComponentBreakpoint = Record<ComponentBreakpointKeys, string>

export type ComponentAs = keyof HTMLElementTagNameMap | 'router-link' | 'RouterLink' | VNode
export type ComponentLabel = string | number | readonly string[] | null
export type ComponentValue = string | number | boolean

export type ResponsiveValue<T> = T | Partial<Record<ComponentBreakpointKeys, T>>

export interface ButtonProps {
  as?: ComponentAs
  variant?: ComponentVariantWithDefault | 'ghost' | 'simple'
  size?: ComponentSizeWithXs
  shape?: 'square' | 'rounded'
  align?: 'left' | 'center' | 'right'
  block?: boolean
  loading?: boolean
  disabled?: boolean
}

export interface ErrorType {
  message: string
  action?: string
  link?: string
  label?: string
}

export interface ComponentOptions {
  label: ComponentLabel
  value: string | number
  disabled?: boolean
}

export type PopoverTrigger = 'click' | 'hover' | 'focus' | 'contextmenu' | 'manual'

export type PopoverBasePosition = 'top' | 'bottom' | 'left' | 'right'
export type PopoverPosition =
  | PopoverBasePosition
  | `${PopoverBasePosition}-start`
  | `${PopoverBasePosition}-end`
