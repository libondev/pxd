export function isNull (value: any): value is null {
  return value === null
}

export function isUndefined (value: any): value is undefined {
  return typeof value === 'undefined'
}

export function isNullOrUndefined (value: any): value is null | undefined {
  return isNull(value) || isUndefined(value)
}
