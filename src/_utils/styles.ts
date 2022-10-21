import type { CSSUnitValue } from '../_types'
import { isNullOrUndefined } from './typeof'

export function getFilledClassNames (classNames: string | string[]): string {
  if (typeof classNames === 'string') {
    classNames = classNames.split(' ')
  }

  return `px-${classNames.join(' px-')}`
}

export function appendCSSUnit (value: CSSUnitValue | string | number | undefined): string | undefined {
  if (isNullOrUndefined(value)) return value

  if (typeof value === 'number') {
    return `${value}px`
  }

  return value
}
