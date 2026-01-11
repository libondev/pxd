import type { Nullable } from '../types/shared/utils'
import { isServer } from './is'

export function getFallbackValue<
  Variants extends Record<string, any>,
>(
  variant: Nullable<string>,
  variants: Variants,
  defaultVariant: keyof Variants = 'default',
) {
  return (variant ? variants[variant] : null) ?? variants[defaultVariant]
}

export function getColorByThreshold(
  value: number,
  colors: Record<string, string>,
): string {
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

  return colors[keys[keyLength - 1]!]!
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
