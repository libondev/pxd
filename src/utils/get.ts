import type { ResponsiveValue } from '../types/shared/props'
import type { Nullable } from '../types/shared/utils'
import { isNil } from 'es-toolkit'
import { isServer } from './is'

export function getFallbackValue<Variants extends Record<string, any>>(
  variant: Nullable<string>,
  variants: Variants,
  defaultVariant: keyof Variants = 'default',
) {
  return (variant ? variants[variant] : null) ?? variants[defaultVariant]
}

export function getColorByThreshold(value: number, colors: Record<string, string>): string {
  const keys = Object.keys(colors)
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
