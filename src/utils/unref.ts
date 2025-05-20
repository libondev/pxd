// https://github.com/vueuse/vueuse/blob/main/packages/core/unrefElement/index.ts#L16

import type { ComponentPublicInstance, MaybeRef, MaybeRefOrGetter } from 'vue'

import { toValue } from 'vue'

export type MaybeElement = HTMLElement | SVGElement | ComponentPublicInstance | undefined | null
export type MaybeElementRef<T extends MaybeElement = MaybeElement> = MaybeRef<T>
export type MaybeComputedElementRef<T extends MaybeElement = MaybeElement> = MaybeRefOrGetter<T>

export type UnRefElementReturn<T extends MaybeElement = MaybeElement> = T extends ComponentPublicInstance ? Exclude<MaybeElement, ComponentPublicInstance> : T | undefined

export function unrefElement<T extends MaybeElement>(elRef: MaybeComputedElementRef<T>): UnRefElementReturn<T> {
  const plain = toValue(elRef)
  return (plain as ComponentPublicInstance)?.$el ?? plain
}
