import type { Awaitable } from './utils'
import type { CSSProperties } from 'vue'

export type ComponentVariant = 'primary' | 'error' | 'warning' | 'success'
export type ComponentVariantWithDefault = ComponentVariant | 'default'

export type ComponentSize = 'sm' | 'md' | 'lg'
export type ComponentSizeWithXs = ComponentSize | 'xs'
export type ComponentSizeWithXxs = ComponentSizeWithXs | 'xxs'

export type ComponentShape = 'default' | 'square' | 'rounded'
export type ComponentBreakpointKeys = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type ComponentBreakpoint<T = string> = Record<ComponentBreakpointKeys, T>

export type ComponentAs = string | object
export type ComponentText = string | number | undefined | null
export type ComponentValue = string | number

export type ComponentClass = string | any[] | Record<string, any>
export type ComponentStyle = CSSProperties | string

export type ComponentAlign = 'left' | 'center' | 'right'
export type ComponentDirection = 'horizontal' | 'vertical'

export type BasePosition = 'top' | 'bottom' | 'left' | 'right'
export type ComponentPosition<Position extends string = BasePosition> =
  | Position
  | `${Position}-start`
  | `${Position}-end`

export type ResponsiveValue<T> = T | Partial<ComponentBreakpoint<T>>

export interface ComponentOption {
  label: ComponentText
  value: ComponentValue
  disabled?: boolean
}

export type ComponentBeforeChange<T> = (value: T) => Awaitable<T>

export type ComponentDateTimeValue = number | string | Date | null
