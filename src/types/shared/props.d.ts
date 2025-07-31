import type { VNode } from 'vue'

export type ComponentVariant = 'primary' | 'error' | 'warning' | 'success'
export type ComponentVariantWithDefault = ComponentVariant | 'default'

export type ComponentSize = 'sm' | 'md' | 'lg'
export type ComponentSizeWithXs = ComponentSize | 'xs'

export type ComponentBreakpointKeys = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type ComponentBreakpoint<T = string> = Record<ComponentBreakpointKeys, T>

export type ComponentAs = keyof HTMLElementTagNameMap | 'router-link' | 'RouterLink' | VNode
export type ComponentLabel = string | number | readonly string[] | null
export type ComponentValue = string | number | boolean

export type ComponentClass = string | any[] | Record<string, any>

export type BasePosition = 'top' | 'bottom' | 'left' | 'right'
export type ComponentPosition
  = | BasePosition
    | `${BasePosition}-start`
    | `${BasePosition}-end`

export type ResponsiveValue<T> = T | Partial<ComponentBreakpoint<T>>

export interface ComponentOption {
  label: ComponentLabel
  value: string | number
  disabled?: boolean
}
