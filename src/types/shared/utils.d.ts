import type { ComponentPublicInstance, MaybeRefOrGetter } from 'vue'

export type Awaitable<T> = T | PromiseLike<T>
export type Callback = (...args: any[]) => any
export type Nullable<T> = T | null | undefined
// export type Numeric = number | `${number}`

export type MaybeElement = Nullable<HTMLElement | SVGElement | ComponentPublicInstance>
export type MaybeElementRef<T extends MaybeElement = MaybeElement> = MaybeRefOrGetter<Nullable<T>>
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends readonly unknown[]
    ? T[K]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K]
}
