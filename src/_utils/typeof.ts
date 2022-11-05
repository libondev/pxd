export function isNull (value: any): value is null {
  return value === null
}

export function isUndefined (value: any): value is undefined {
  return typeof value === 'undefined'
}

export function isNullOrUndefined (value: any): value is boolean {
  return isNull(value) || isUndefined(value)
}

// export function typeOf (value: number): 'Number'
// export function typeOf (value: string): 'String'
// export function typeOf (value: boolean): 'Boolean'
// export function typeOf (value: unknown[]): 'Array'
// export function typeOf (value: Record<string, unknown>): 'Object'
// export function typeOf (value: unknown): string {
//   return ({}).toString.call(value).slice(8, -1)
// }

export function toArray<T> (value: T | T[]): T[] {
  if (Array.isArray(value)) {
    return value
  }

  return [value]
}
