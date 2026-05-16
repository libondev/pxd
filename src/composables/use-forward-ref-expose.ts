import type { MaybeRefOrGetter } from 'vue'
import { toValue } from '../utils/helper'

export function useForwardRefExpose<T extends object>(
  refEl: MaybeRefOrGetter<T | null | undefined>,
) {
  return new Proxy({} as T, {
    get(_, prop) {
      const target = toValue(refEl)
      if (!target) {
        return undefined
      }

      const value = Reflect.get(target, prop, target)
      return typeof value === 'function' ? value.bind(target) : value
    },
    set(_, prop, value) {
      const target = toValue(refEl)
      if (!target) {
        return false
      }

      return Reflect.set(target, prop, value, target)
    },
    has(_, prop) {
      const target = toValue(refEl)
      if (!target) {
        return false
      }

      return prop in target
    },
    ownKeys() {
      const target = toValue(refEl)
      if (!target) {
        return []
      }

      return Reflect.ownKeys(target)
    },
    getOwnPropertyDescriptor(_, prop) {
      const target = toValue(refEl)
      if (!target) {
        return undefined
      }

      return Reflect.getOwnPropertyDescriptor(target, prop)
    },
  })
}
