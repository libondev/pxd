import type { ComponentPublicInstance, MaybeRefOrGetter } from 'vue'

export type Awaitable<T> = T | PromiseLike<T>
export type Callback = (...args: any[]) => any
export type Nullable<T> = T | null | undefined
export type Numeric = number | `${number}`

// e.g.: 10 | '10' | '10px' | '-10px'
export type CSSValue = Numeric | CSSUnitValue

export type MaybeElement = Nullable<HTMLElement | SVGElement | ComponentPublicInstance>
export type MaybeElementRef<T extends MaybeElement = MaybeElement> = MaybeRefOrGetter<Nullable<T>>
export type MaybeComputedElementRef<T extends MaybeElement = MaybeElement> = MaybeRefOrGetter<Nullable<T>>
