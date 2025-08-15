import type { ResponsiveValue } from '../types/shared'

export function getResponsiveValue<T extends string | number>(
  propsValue: ResponsiveValue<T>,
  defaultValue: Record<string, T> = {},
  valueSetter: (acc: Record<string, T>, bp: string, v: T) => void,
) {
  if (typeof propsValue === 'object') {
    return Object.entries(propsValue).reduce((acc, [bp, value]) => {
      valueSetter(acc, bp, value)

      return acc
    }, defaultValue)
  }

  return defaultValue
}
