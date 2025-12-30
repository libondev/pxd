import type { Nullable } from '../types/shared/utils'

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
