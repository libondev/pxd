export function autoUnit(target: string | number): string {
  // @ts-expect-error do it
  // eslint-disable-next-line unicorn/prefer-number-properties
  if (typeof target === 'number' || !isNaN(target as number))
    return `${target}px`

  return target
}

/**
 * Increase string a value with unit
 *
 * @example '2px' + 1 = '3px'
 * @example '15em' + (-2) = '13em'
 */
// export function increaseWithUnit(target: number, delta: number): number
// export function increaseWithUnit(target: string, delta: number): string
// export function increaseWithUnit(target: string | number, delta: number): string | number
// export function increaseWithUnit(target: string | number, delta: number): string | number {
//   if (typeof target === 'number')
//     return target + delta
//   const value = target.match(/^-?\d+\.?\d*/)?.[0] || ''
//   const unit = target.slice(value.length)
//   const result = (Number.parseFloat(value) + delta)
//   if (Number.isNaN(result))
//     return target
//   return result + unit
// }

// export function getUnitValue(target: string): { value: string, unit: string } {
//   const value = target.match(/^-?\d+\.?\d*/)?.[0] || ''
//   const unit = target.slice(value.length)

//   return { value, unit }
// }

export function getFlowDirection(propValue: string): '' | 'flex-col' {
  if (propValue === 'row')
    return ''

  return 'flex-col'
}

export function getStandardSize(mergeSizes?: Record<string, string>): (v: string) => string {
  const _SIZES = {
    small: 'h-7 text-sm',
    default: 'h-8 text-sm',
    large: 'h-10 text-base',
  }

  // 挨个合并，使用 assign 会直接覆盖
  if (mergeSizes) {
    Object.keys(mergeSizes).forEach((key) => {
      if (key in _SIZES) {
        _SIZES[key] += ` ${mergeSizes[key]}`
      }
      else {
        _SIZES[key] = mergeSizes[key]
      }
    })
  }

  return (propValue: string) => _SIZES[propValue] || _SIZES.default
}
