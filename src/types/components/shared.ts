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

export type ComponentBasePosition = 'top' | 'bottom' | 'left' | 'right'
export type ComponentPosition
  = | ComponentBasePosition
    | `${ComponentBasePosition}-start`
    | `${ComponentBasePosition}-end`

export type ResponsiveValue<T> = T | Partial<Record<ComponentBreakpointKeys, T>>

export interface ComponentOption {
  label: ComponentLabel
  value: string | number
  disabled?: boolean
}
