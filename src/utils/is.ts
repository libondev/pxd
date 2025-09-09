import { version } from 'vue'

export const isVue3 = version.startsWith('3')

export const isServer = typeof window === 'undefined'

export const isTouchDevice = () => typeof document === 'undefined' ? false : 'ontouchstart' in document

// https:// github.com/vueuse/vueuse/blob/main/packages/shared/utils/is.ts#L5
export const isNotNullish = <T>(value: T): value is NonNullable<T> => value != null

export const isIOS = /* #__PURE__ */ getIsIOS()

function getIsIOS() {
  return !isServer && window?.navigator?.userAgent && (
    (/iP(?:ad|hone|od)/.test(window.navigator.userAgent))
    // The new iPad Pro Gen3 does not identify itself as iPad, but as Macintosh.
    // https://github.com/vueuse/vueuse/issues/3577
    || (window?.navigator?.maxTouchPoints > 2 && /iPad|Macintosh/.test(window?.navigator.userAgent))
  )
}
