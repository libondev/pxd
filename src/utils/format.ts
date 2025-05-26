import type { Nullable } from '../types/shared'

export function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export function isExternalLink(href: string) {
  const firstChar = href.slice(0, 1)

  if (['#', '/'].includes(firstChar)) {
    return false
  }

  return true
}

export function toArray(value: unknown | unknown[]) {
  if (value === null || value === undefined) {
    return []
  }

  if (Array.isArray(value)) {
    return value
  }

  if (value instanceof Set) {
    return Array.from(value)
  }

  if (value instanceof Map) {
    return Array.from(value.entries())
  }

  return [value]
}

const CSS_UNIT_REGEX = /^\d+$/
export function getCssUnitValue(
  value: Nullable<string | number>,
  fallbackValue?: string | number,
) {
  if (value == null) {
    return fallbackValue
  }

  if (typeof value === 'number' || CSS_UNIT_REGEX.test(value)) {
    return `${value}px`
  }

  return value
}

// https://github.com/vueuse/vueuse/blob/main/packages/shared/utils/general.ts#L71
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
  if (typeof target === 'number') {
    return target + delta
  }

  const value = target.match(/^-?\d+\.?\d*/)?.[0] || ''
  const unit = target.slice(value.length)
  const result = (Number.parseFloat(value) + delta)

  if (Number.isNaN(result)) {
    return target
  }

  return result + unit
}
