import type { CSSValue, Nullable } from '../types/shared/utils'
import { FLOATING_REGEX, INTEGER_REGEX } from './regexp'

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
  return text.charAt(0).toUpperCase() + text.slice(1).replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ''))
}

/** KababCase -> kabab-case */
export function uncapitalize(text: string) {
  return text.charAt(0).toLowerCase() + text.slice(1).replace(/([A-Z])/g, '-$1').toLowerCase()
}

/** 'kabab-case' -> 'Kabab Case' */
export function humanize(text: string) {
  return text.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
}

// 某些没有主动声明的二次封装组件中透传 boolean 类型的值可能会是一个空字符串
export function isTruthyProp(value: unknown) {
  return value || value === ''
}

export function clampValue(n: number, min: number, max: number) {
  return min != null && max != null
    ? Math.min(Math.max(n, min), max)
    : n
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

export function getCssUnitValue(
  value: Nullable<CSSValue | string>,
  fallbackValue?: string,
): string {
  if (value == null || value === '') {
    return fallbackValue!
  }

  if (typeof value === 'number' || INTEGER_REGEX.test(value as string)) {
    return `${value}px`
  }

  return value as string
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

  const value = String(target).match(FLOATING_REGEX)?.[0] || ''
  const unit = String(target).slice(value.length)
  const result = (Number.parseFloat(value) + delta)

  if (Number.isNaN(result)) {
    return target as string
  }

  return result + unit
}
