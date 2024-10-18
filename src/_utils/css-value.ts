/**
 * Increase string a value with unit
 *
 * @example '2px' + 1 = '3px'
 * @example '15em' + (-2) = '13em'
 */
export function increaseWithUnit(target: number, delta: number): number
export function increaseWithUnit(target: string, delta: number): string
export function increaseWithUnit(target: string | number, delta: number): string | number
export function increaseWithUnit(target: string | number, delta: number): string | number {
  if (typeof target === 'number')
    return target + delta
  const value = target.match(/^-?\d+\.?\d*/)?.[0] || ''
  const unit = target.slice(value.length)
  const result = (Number.parseFloat(value) + delta)
  if (Number.isNaN(result))
    return target
  return result + unit
}

export function autoUnit(target: string | number): string {
  // @ts-expect-error do it
  // eslint-disable-next-line unicorn/prefer-number-properties
  if (typeof target === 'number' || !isNaN(target as number))
    return `${target}px`

  return target
}

// export function getUnitValue(target: string): { value: string, unit: string } {
//   const value = target.match(/^-?\d+\.?\d*/)?.[0] || ''
//   const unit = target.slice(value.length)

//   return { value, unit }
// }
