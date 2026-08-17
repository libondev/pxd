import type { ResponsiveValue } from '../types/shared/props'
import type { Nullable } from '../types/shared/utils'
import type { MaybeElement } from '../types/shared/utils'
import type { ComponentPublicInstance, MaybeRefOrGetter } from 'vue'
import { unref } from 'vue'
import { isNil, isServer } from './is.js'

let _id = 0

export function getUniqueId(prefix: string = '') {
  return `${prefix}_pid_${_id++}`
}

export function getFallbackValue<Variants extends Record<string, any>>(
  variant: Nullable<string>,
  variants: Variants,
  defaultVariant: keyof Variants = 'default',
) {
  return (variant ? variants[variant] : null) ?? variants[defaultVariant]
}

export function getColorByThreshold(value: number, colors: Record<string, string>): string {
  const keys = Object.keys(colors).sort((a, b) => Number(a) - Number(b))
  const keyLength = keys.length

  if (keyLength === 0) {
    return ''
  }

  for (let i = 0; i < keyLength; i++) {
    if (value < Number(keys[i])) {
      return colors[keys[i - 1]!]!
    }
  }

  return colors[keys.at(-1)!]!
}

type DocumentDirection = 'rtl' | 'ltr' | 'auto'

export function getDocumentDirection(): DocumentDirection {
  if (isServer()) {
    return 'ltr'
  }

  const dirAttribute = document.documentElement.getAttribute('dir')

  if (dirAttribute === 'auto' || !dirAttribute) {
    return window.getComputedStyle(document.documentElement).direction as DocumentDirection
  }

  return dirAttribute as DocumentDirection
}

export function getPlatform() {
  if (isServer()) {
    return 'linux'
  }

  const platform = navigator.platform.toLowerCase()
  const userAgent = navigator.userAgent.toLowerCase()

  if (platform.includes('mac') || userAgent.includes('mac')) {
    return 'mac'
  }
  if (platform.includes('win') || userAgent.includes('win')) {
    return 'windows'
  }

  return 'linux'
}

export function getResponsiveValue<V extends string | number>(
  prop: ResponsiveValue<V> | undefined,
  xsValue: Nullable<V>,
  valueSetter: (acc: Record<string, V>, bp: any, v: V) => void,
) {
  const formatted = Object.assign(
    isNil(xsValue) ? {} : { xs: xsValue },
    typeof prop === 'object' ? prop : {},
  )

  return Object.entries(formatted).reduce(
    (acc, [bp, value]) => {
      valueSetter(acc, bp, value)

      return acc
    },
    {} as Parameters<typeof valueSetter>[0],
  )
}

export type UnRefElementReturn<T extends MaybeElement = MaybeElement> =
  T extends ComponentPublicInstance ? Exclude<MaybeElement, ComponentPublicInstance> : T | undefined

export function toValue<T>(source: MaybeRefOrGetter<T>): T {
  return typeof source === 'function' ? (source as () => T)() : unref(source)
}

type PromiseWithResolvers<T> = {
  promise: Promise<T>
  resolve: (value: T | PromiseLike<T>) => void
  reject: (reason?: unknown) => void
}

export function withResolvers<T>(): PromiseWithResolvers<T> {
  if (typeof Promise.withResolvers === 'function') {
    return Promise.withResolvers<T>()
  }

  let resolve!: (value: T | PromiseLike<T>) => void
  let reject!: (reason?: unknown) => void

  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })

  return { promise, resolve, reject }
}
