import { version } from 'vue'

export const isVue3 = () => version.startsWith('3')
export const isServer = () => typeof document === 'undefined'
export const isTouchDevice = () => (isServer() ? false : 'ontouchstart' in document)

export function isIOS(): boolean {
  if (isServer()) {
    return false
  }

  const userAgent = navigator?.userAgent || ''

  return (
    /iP(?:ad|hone|od)/.test(userAgent) ||
    // The new iPad Pro Gen3 does not identify itself as iPad, but as Macintosh.
    // https://github.com/vueuse/vueuse/issues/3577
    (navigator?.maxTouchPoints > 2 && /iPad|Macintosh/.test(userAgent))
  )
}

export const isNil = (value: unknown): value is null | undefined => value == null
export const isNotNil = <T>(value: T | null | undefined): value is T => value != null
export const isUndefined = (value: unknown): value is undefined => value === undefined
export const isNumber = (value: unknown): value is number => typeof value === 'number'
