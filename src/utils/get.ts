import type { Nullable } from '../types/shared/utils'

type PathArray = ReadonlyArray<PropertyKey>

type PathValue<T, P extends PathArray>
  = P extends [] ? T
    : P extends [infer K, ...infer R]
      ? K extends PropertyKey
        ? R extends PathArray
          ? PathValue<GetAtStep<NonNullable<T>, K>, R>
          : unknown
        : unknown
      : unknown

type GetAtStep<T, K>
  = K extends keyof T ? T[K]
    : K extends number
      ? T extends readonly (infer U)[] ? U
        : T extends { [key: number]: infer V } ? V
          : unknown
      : K extends string
        ? K extends keyof T ? T[K]
          : unknown
        : K extends symbol
          ? K extends keyof T ? T[K]
            : unknown
          : unknown

const isIntegerKey = (s: string) => /^\d+$/.test(s)

function toPath(input: string | PropertyKey | PathArray): PropertyKey[] {
  if (Array.isArray(input)) {
    return input.slice()
  }
  if (typeof input === 'symbol') {
    return [input]
  }
  if (typeof input === 'number') {
    return [input]
  }
  if (typeof input !== 'string') {
    return [String(input)]
  }
  if (input.length === 0) {
    return []
  }

  const str = input
  const result: PropertyKey[] = []
  let token = ''
  let i = 0

  const pushToken = () => {
    if (token.length > 0) {
      result.push(isIntegerKey(token) ? Number(token) : token)
      token = ''
    }
  }

  while (i < str.length) {
    const ch = str[i]

    if (ch === '.') {
      pushToken()
      i++
      continue
    }

    if (ch === '[') {
      pushToken()
      i++

      while (
        i < str.length
        && (str[i] === ' ' || str[i] === '\t' || str[i] === '\n' || str[i] === '\r')
      ) {
        i++
      }
      if (i >= str.length) {
        break
      }

      const start = str[i]

      if (start === '\'' || start === '"') {
        const quote = start
        i++
        let content = ''
        while (i < str.length) {
          const cc = str[i]
          if (cc === '\\') {
            i++
            if (i < str.length) {
              content += str[i]
              i++
            } else {
              break
            }
            continue
          }
          if (cc === quote) {
            i++
            break
          }
          content += cc
          i++
        }
        result.push(content)
        while (
          i < str.length
          && (str[i] === ' ' || str[i] === '\t' || str[i] === '\n' || str[i] === '\r')
        ) {
          i++
        }
        if (str[i] === ']') {
          i++
        }
        continue
      }

      let content = ''
      while (i < str.length && str[i] !== ']') {
        content += str[i]
        i++
      }
      if (str[i] === ']') {
        i++
      }

      const trimmed = content.trim()
      if (trimmed.length > 0) {
        result.push(isIntegerKey(trimmed) ? Number(trimmed) : trimmed)
      } else {
        // empty bracket [] treated as no-op
      }
      continue
    }

    if (ch === '\\') {
      i++
      if (i < str.length) {
        token += str[i]
        i++
      } else {
        break
      }
      continue
    }

    token += ch
    i++
  }

  pushToken()
  return result
}

export function get<T, P extends PathArray, D = undefined>(
  obj: T,
  path: P,
  defaultValue?: D,
): PathValue<T, P> | D
export function get<T, D = undefined>(
  obj: T,
  path: string | PropertyKey,
  defaultValue?: D,
): unknown | D
export function get(obj: any, path: any, defaultValue?: any) {
  if (obj == null) {
    return defaultValue
  }

  const segments: PropertyKey[] = toPath(path)

  if (segments.length === 0) {
    return obj === undefined ? defaultValue : obj
  }

  let cur: any = obj
  for (let i = 0; i < segments.length; i++) {
    const key = segments[i] as any
    if (cur == null) {
      return defaultValue
    }
    cur = cur[key]
  }

  return cur === undefined ? defaultValue : cur
}

export function getFallbackValue<
  Variants extends Record<string, any>,
>(
  variant: Nullable<string>,
  variants: Variants,
  defaultVariant: keyof Variants = 'default',
) {
  return (variant ? variants[variant] : null) ?? variants[defaultVariant]
}

export function getColorByThreshold(
  value: number,
  colors: Record<string, string>,
): string {
  const keys = Object.keys(colors)
  const keyLength = keys.length

  if (keyLength === 0) {
    return ''
  }

  for (let i = 0; i < keyLength; i++) {
    if (value < Number(keys[i])) {
      return colors[keys[i - 1]]
    }
  }

  return colors[keys.at(-1)!]
}
