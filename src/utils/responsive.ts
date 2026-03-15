import type { ResponsiveValue } from '../types/shared/props'
import type { Nullable } from '../types/shared/utils'
import { isNil } from 'es-toolkit'

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
