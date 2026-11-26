export const isServer = () => typeof document === 'undefined'
export const isTouchDevice = () => {
  if (isServer() || typeof matchMedia !== 'function') {
    return false
  }

  return matchMedia('(hover: none) and (pointer: coarse)').matches
}

export const isNil = (value: unknown): value is null | undefined => value == null
export const isNotNil = <T>(value: T | null | undefined): value is T => value != null
export const isUndefined = (value: unknown): value is undefined => value === undefined
export const isNumber = (value: unknown): value is number => typeof value === 'number'
