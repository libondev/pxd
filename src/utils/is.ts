import { version } from 'vue'

export const isVue3 = version.startsWith('3')

export const isServer = typeof window === 'undefined'

export const isTouchDevice = () => typeof document === 'undefined' ? false : 'ontouchstart' in document

// https:// github.com/vueuse/vueuse/blob/main/packages/shared/utils/is.ts#L5
export const isNotNullish = <T>(value: T): value is NonNullable<T> => value != null
