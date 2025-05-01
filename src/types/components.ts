import type { VNode } from 'vue'

export type ComponentSize = 'sm' | 'md' | 'lg'
export type ComponentSizeWithXs = ComponentSize | 'xs'
export type ComponentBreakpointKeys = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type ComponentBreakpoint = Record<ComponentBreakpointKeys, string>
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

type ResponsiveValue<T> = T | Partial<Record<ComponentBreakpointKeys, T>>

export interface StackProps {
  as?: ComponentAs
  wrap?: boolean
  gap?: number | string | ResponsiveValue<number>
  align?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly' | 'stretch'
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly' | 'stretch'
  direction?: 'row' | 'col' | ResponsiveValue<'row' | 'col'>
}

export interface ErrorType {
  message: string
  action?: string
  link?: string
  label?: string
}
