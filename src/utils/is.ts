import { version } from 'vue'

export const isVue3 = () => version.startsWith('3')
export const isServer = () => typeof document === 'undefined'
export const isTouchDevice = () => (isServer() ? false : 'ontouchstart' in document)

export function isIOS() {
  return (
    !isServer() &&
    navigator?.userAgent &&
    (/iP(?:ad|hone|od)/.test(navigator.userAgent) ||
      // The new iPad Pro Gen3 does not identify itself as iPad, but as Macintosh.
      // https://github.com/vueuse/vueuse/issues/3577
      (navigator?.maxTouchPoints > 2 && /iPad|Macintosh/.test(navigator.userAgent)))
  )
}
