// https://github.com/vueuse/vueuse/blob/main/packages/core/unrefElement/index.ts#L16

import type { ComponentPublicInstance, MaybeRef, MaybeRefOrGetter } from 'vue'

import type { Nullable } from '../types/shared/utils'
import { unref } from 'vue'

export type MaybeElement = Nullable<HTMLElement | SVGElement | ComponentPublicInstance>
export type MaybeElementRef<T extends MaybeElement = MaybeElement> = MaybeRef<T>
export type MaybeComputedElementRef<T extends MaybeElement = MaybeElement> = MaybeRefOrGetter<T>

export type UnRefElementReturn<T extends MaybeElement = MaybeElement> = T extends ComponentPublicInstance
  ? Exclude<MaybeElement, ComponentPublicInstance>
  : T | undefined

export function toValue<T>(source: MaybeRefOrGetter<T>): T {
  return typeof source === 'function' ? (source as () => T)() : unref(source)
}

export function unrefElement<T extends MaybeElement>(elRef: MaybeRefOrGetter<T>): UnRefElementReturn<T> {
  const plain = toValue(elRef)
  return (plain as ComponentPublicInstance)?.$el ?? plain
}
