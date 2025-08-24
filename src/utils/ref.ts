// https://github.com/vueuse/vueuse/blob/main/packages/core/unrefElement/index.ts#L16

import type { ComponentPublicInstance, MaybeRefOrGetter } from 'vue'

import type { MaybeElement } from '../types/shared/utils'
import { unref } from 'vue'

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
