import type { CSSUnitValue } from '../_types'

export function createClassName (
  element: string,
  modifier: Array<string | boolean> = [],
  status: string | Array<string | boolean> = []
): string {
  let className = `c-${element}`

  modifier = modifier.filter(Boolean)
  if (modifier.length) {
    className += ` c-${element}--${modifier.join(` c-${element}--`)}`
  }

  if (typeof status === 'string') {
    className += ` ${status}`
  } else {
    status = status.filter(Boolean)
    className += ` ${status.join(' ')}`
  }

  return className
}

export function appendCSSUnit (value: CSSUnitValue | string | number): string {
  if (typeof value === 'number') {
    return `${value}px`
  }

  return value
}
