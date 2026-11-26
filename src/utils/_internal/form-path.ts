import type { FormPath } from '../../types/shared/form'

function segments(path: FormPath): Array<string | number> {
  if (typeof path === 'string') {
    return path === ''
      ? []
      : path.split('.').map((segment) => (/^\d+$/.test(segment) ? Number(segment) : segment))
  }

  return [...path]
}

export function formatPath(path: FormPath): string {
  return typeof path === 'string' ? path : path.join('.')
}

export function getPath(source: unknown, path: FormPath): unknown {
  let current: any = source

  for (const key of segments(path)) {
    if (current == null) {
      return undefined
    }

    current = current[key]
  }

  return current
}

export function setPath(
  target: Record<string | number, any>,
  path: FormPath,
  value: unknown,
): void {
  const keys = segments(path)

  if (!keys.length) {
    return
  }

  let current: any = target

  for (let index = 0; index < keys.length - 1; index++) {
    const key = keys[index]
    const next = current[key]

    if (next == null || typeof next !== 'object') {
      current[key] = typeof keys[index + 1] === 'number' ? [] : {}
    }

    current = current[key]
  }

  current[keys[keys.length - 1]] = value
}

export function slugifyPath(path: FormPath): string {
  return (
    formatPath(path)
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'field'
  )
}

export function matchesPath(path: FormPath, key: string): boolean {
  const formatted = formatPath(path)

  return formatted === key || (key !== '' && formatted.startsWith(`${key}.`))
}
