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
export function getCssUnitValue(value?: string | number) {
  if (value === undefined) {
    return undefined
  }

  if (typeof value === 'number' || CSS_UNIT_REGEX.test(value)) {
    return `${value}px`
  }

  return value
}
