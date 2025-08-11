import type { MaybeRef } from 'vue'

export type Callback = (...args: any[]) => any
export type Nullable<T> = T | null | undefined
export type DOMRef<T = HTMLElement> = MaybeRef<T | null | undefined>
