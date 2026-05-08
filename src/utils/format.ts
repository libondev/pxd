import type { Nullable } from '../types/shared/utils'

const INTEGER_REGEX = /^-?\d+$/
const FLOATING_REGEX = /^-?\d+\.?\d*/

/** string -> String */
export function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

const camelizeRE = /-(\w)/g
/** kabab-case -> kababCase */
export function camelize(str: string): string {
  return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ''))
}

/** kabab-case -> KababCase */
export function pascalize(text: string) {
  return (
    text.charAt(0).toUpperCase() +
    text.slice(1).replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ''))
  )
}

/** KababCase -> kabab-case */
export function uncapitalize(text: string) {
  return (
    text.charAt(0).toLowerCase() +
    text
      .slice(1)
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
  )
}

/** 'kabab-case' -> 'Kabab Case' */
export function humanize(text: string) {
  return text.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

// Some components that do not actively declare boolean values may pass an empty string
// This function is used to check if the value is a boolean or an empty string
export function isTruthyProp(value: unknown): boolean {
  return Boolean(value) || value === ''
}

export function clampValue(n: number, min: number, max: number) {
  return min != null && max != null ? Math.min(Math.max(n, min), max) : n
}

export function isExternalLink(href: string) {
  const firstChar = href.slice(0, 1)

  if (['#', '/'].includes(firstChar)) {
    return false
  }

  return true
}

export function toArray(value: unknown) {
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

export function getCssUnitValue(value: Nullable<string | number>, fallbackValue?: string): string {
  if (value == null || value === '') {
    return fallbackValue!
  }

  if (typeof value === 'number' || INTEGER_REGEX.test(String(value))) {
    return `${String(value)}px`
  }

  return String(value)
}

export function parseUnitValue(target: string | number) {
  if (typeof target === 'string') {
    const string = String(target)
    const value = string.match(FLOATING_REGEX)?.[0] || ''
    const unit = string.slice(value.length)

    return {
      number: Number.parseFloat(value),
      unit,
    }
  }

  return {
    number: target,
    unit: '',
  }
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

  const { number, unit } = parseUnitValue(target)

  const result = number + delta

  if (Number.isNaN(result)) {
    return target as string
  }

  return result + unit
}
