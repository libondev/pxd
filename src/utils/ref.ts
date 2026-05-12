import type { MaybeElement } from '../types/shared/utils'
import type { ComponentPublicInstance, MaybeRefOrGetter } from 'vue'
import { unref } from 'vue'

export type UnRefElementReturn<T extends MaybeElement = MaybeElement> =
  T extends ComponentPublicInstance ? Exclude<MaybeElement, ComponentPublicInstance> : T | undefined

export function toValue<T>(source: MaybeRefOrGetter<T>): T {
  return typeof source === 'function' ? (source as () => T)() : unref(source)
}
