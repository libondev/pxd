import type { ResponsiveValue } from '../types/shared/props'
import type { Nullable } from '../types/shared/utils'
import { getCurrentInstance } from 'vue'
import { isNil } from './is.js'

let fallbackId = 0
const uniqueIdMap = new WeakMap<object, number>()

export function getUniqueId(prefix: string = '') {
  const root = getCurrentInstance()?.proxy?.$root

  if (!root) {
    return `${prefix}_pid_${fallbackId++}`
  }

  const id = uniqueIdMap.get(root) ?? 0
  uniqueIdMap.set(root, id + 1)

  return `${prefix}_pid_${id}`
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
      return colors[keys[Math.max(0, i - 1)]!]!
    }
  }

  return colors[keys.at(-1)!]!
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
