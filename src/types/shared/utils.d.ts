import type { MaybeRef } from 'vue'

export type Awaitable<T> = T | PromiseLike<T>
export type Callback = (...args: any[]) => any
export type Nullable<T> = T | null | undefined
export type DOMRef<T = HTMLElement> = MaybeRef<Nullable<T>>
export type Numeric = number | `${number}`

// e.g.: 10 | '10' | '10px' | '-10px'
export type CSSValue = Numeric | CSSUnitValue
