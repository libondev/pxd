import type { CSSUnitValue } from '../_types'
import { isNullOrUndefined } from './typeof'

export function appendCSSUnit (value: CSSUnitValue | string | number | undefined): string | undefined {
  if (isNullOrUndefined(value)) return value

  if (typeof value === 'number') {
    return `${value}px`
  }

  return value
}
